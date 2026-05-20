import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const entries = await prisma.analyticsEntry.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { periodStart: 'desc' },
    include: { client: { select: { name: true } } },
  })
  return NextResponse.json(entries)
}

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

export async function POST(req: NextRequest) {
  const raw = await req.json()
  const entry = await prisma.analyticsEntry.create({ data: coerceAnalytics(raw) })
  return NextResponse.json(entry, { status: 201 })
}
