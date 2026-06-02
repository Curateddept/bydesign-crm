import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: 'google_refresh_token' } })
  return NextResponse.json({ connected: !!setting?.value })
}

export async function DELETE() {
  await prisma.setting.deleteMany({ where: { key: 'google_refresh_token' } })
  return NextResponse.json({ ok: true })
}
