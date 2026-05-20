import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function coerceAnalytics(raw: any) {
  const toInt  = (v: any) => v === '' || v === null || v === undefined ? null : parseInt(v)
  const toFloat = (v: any) => v === '' || v === null || v === undefined ? null : parseFloat(v)
  return {
    ...raw,
    followers:       toInt(raw.followers),
    followersGrowth: toInt(raw.followersGrowth),
    reach:           toInt(raw.reach),
    impressions:     toInt(raw.impressions),
    likes:           toInt(raw.likes),
    comments:        toInt(raw.comments),
    shares:          toInt(raw.shares),
    saves:           toInt(raw.saves),
    engagementRate:  toFloat(raw.engagementRate),
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await req.json()
  const entry = await prisma.analyticsEntry.update({ where: { id }, data: coerceAnalytics(raw) })
  return NextResponse.json(entry)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.analyticsEntry.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
