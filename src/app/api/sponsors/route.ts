import { NextResponse } from 'next/server';

const leads: any[] = [
  {
    id: 'lead_1',
    name: 'Michael Chang',
    company: 'Apex Point of Sale Solutions',
    email: 'm.chang@apexpos.com',
    website: 'https://apexpos.example.com',
    region: 'Enterprise Accounts',
    tier: 'Top Leaderboard Banner Sponsor',
    message: 'We provide cloud POS for over 400 restaurants nationwide. Interested in a 3-month exclusive top banner.',
    status: 'new',
    createdAt: '2026-10-30T16:40:00Z',
  },
  {
    id: 'lead_2',
    name: 'Emily Watson',
    company: 'Apex Commercial Printing Group',
    email: 'emily@apexprint.example.com',
    website: 'https://apexprint.example.com',
    region: 'Global / Multi-Region',
    tier: 'Print Template Exclusive Partner',
    message: 'Looking to partner as the recommended print provider for PDF table tents and vinyl storefront decals.',
    status: 'contacted',
    createdAt: '2026-10-29T12:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json({ success: true, leads });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.email || !data.company) {
      return NextResponse.json({ error: 'Name, email, and company are required.' }, { status: 400 });
    }

    const newLead = {
      id: `lead_${Date.now()}`,
      name: data.name,
      company: data.company,
      email: data.email,
      website: data.website || '',
      region: data.region || 'Worldwide / Global',
      tier: data.tier || 'Top Leaderboard Banner Sponsor',
      message: data.message || '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    leads.unshift(newLead);
    return NextResponse.json({ success: true, lead: newLead });
  } catch {
    return NextResponse.json({ error: 'Failed to process lead inquiry' }, { status: 500 });
  }
}

