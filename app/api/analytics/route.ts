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

export async function POST(req: NextRequest) {
  const data = await req.json()
  const entry = await prisma.analyticsEntry.create({ data })
  return NextResponse.json(entry, { status: 201 })
}
