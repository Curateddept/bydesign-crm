import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const deliverables = await prisma.deliverable.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { dueDate: 'asc' },
    include: { client: { select: { name: true } } },
  })
  return NextResponse.json(deliverables)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const deliverable = await prisma.deliverable.create({ data })
  return NextResponse.json(deliverable, { status: 201 })
}
