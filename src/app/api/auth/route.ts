import { NextResponse } from 'next/server';

// Server-side user registry
const users: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, name, role } = body;

    if (action === 'register') {
      if (!email || !name) {
        return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
      }

      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ success: true, user: existing });
      }

      const isAdmin = role === 'admin' || email.toLowerCase().endsWith('@strixdevs.com');
      const newUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === 'login') {
      if (!email) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
      }

      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return NextResponse.json({ error: 'User not found. Please register.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error processing auth request' }, { status: 500 });
  }
}
