import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PIN = process.env.ADMIN_PIN || '4TWC2024'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()

  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return res
}
