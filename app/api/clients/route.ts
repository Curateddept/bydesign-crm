import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { deliverables: true, contentItems: true } },
    },
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const raw = await req.json()
  const data = {
    ...raw,
    monthlyRate:   raw.monthlyRate   !== undefined ? (raw.monthlyRate   === '' || raw.monthlyRate   === null ? null : parseFloat(raw.monthlyRate))   : undefined,
    paymentDueDay: raw.paymentDueDay !== undefined ? (raw.paymentDueDay === '' || raw.paymentDueDay === null ? null : parseInt(raw.paymentDueDay))   : undefined,
    portalEnabled: raw.portalEnabled !== undefined ? Boolean(raw.portalEnabled) : undefined,
  }
  const client = await prisma.client.create({ data })
  return NextResponse.json(client, { status: 201 })
}
