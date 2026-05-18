import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const items = await prisma.contentItem.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { scheduledAt: 'asc' },
    include: { client: { select: { name: true } } },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const item = await prisma.contentItem.create({ data })
  return NextResponse.json(item, { status: 201 })
}
