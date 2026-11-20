import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';
    const body = await req.json().catch(() => ({}));
    const targetEmail = (body.email || '').trim().toLowerCase();
    const targetId = body.id;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        verified: false,
        error: 'Supabase credentials not configured on server',
      }, { status: 500 });
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    // 1. If an auth token is provided, verify it cryptographically with Supabase Auth
    let verifiedUserId: string | null = null;
    let verifiedEmail: string | null = null;

    if (token) {
      const { data: { user: sbUser }, error: tokenErr } = await sb.auth.getUser(token);
      if (!tokenErr && sbUser) {
        verifiedUserId = sbUser.id;
        verifiedEmail = (sbUser.email || '').toLowerCase().trim();
      }
    }

    const queryId = verifiedUserId || targetId;
    const queryEmail = verifiedEmail || targetEmail;

    if (!queryId && !queryEmail) {
      return NextResponse.json({
        verified: false,
        error: 'Missing identification credentials',
      }, { status: 400 });
    }

    // 2. Fetch authoritative profile from PostgreSQL public.profiles
    let query = sb.from('profiles').select('*');
    if (queryId && queryEmail) {
      query = query.or(`id.eq.${queryId},email.ilike.${queryEmail}`);
    } else if (queryId) {
      query = query.eq('id', queryId);
    } else {
      query = query.ilike('email', queryEmail);
    }

    const { data: profiles, error } = await query;

    if (error || !profiles || profiles.length === 0) {
      return NextResponse.json({
        verified: Boolean(verifiedUserId),
        user: {
          id: queryId,
          email: queryEmail,
          role: 'user',
          tier: 'free',
        },
      });
    }

    const profile = profiles.find((p: any) => p.id === queryId) || profiles[0];

    return NextResponse.json({
      verified: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role || 'user',
        tier: profile.tier || 'free',
        avatarUrl: profile.avatar_url,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ verified: false, error: err.message }, { status: 500 });
  }
}
