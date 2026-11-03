import { NextResponse } from 'next/server';

// Server-side in-memory user registry with seeded accounts
const users = [
  {
    id: 'user_admin',
    name: 'StrixDevs Admin',
    email: 'admin@strixdevs.com',
    role: 'admin',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'user_demo',
    name: 'Sarah Jenkins',
    email: 'user@strixdevs.com',
    role: 'user',
    createdAt: '2026-10-20T14:30:00Z',
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, name, role } = body;

    if (action === 'demo_admin') {
      const admin = users.find((u) => u.role === 'admin') || users[0];
      return NextResponse.json({ success: true, user: admin });
    }

    if (action === 'demo_user') {
      const demo = users.find((u) => u.role === 'user') || users[1];
      return NextResponse.json({ success: true, user: demo });
    }

    if (action === 'register') {
      if (!email || !name) {
        return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
      }

      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ success: true, user: existing });
      }

      const newUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: role === 'admin' ? 'admin' : 'user',
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

