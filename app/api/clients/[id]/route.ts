import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      contracts: { orderBy: { createdAt: 'desc' } },
      deliverables: { orderBy: { dueDate: 'asc' } },
      analytics: { orderBy: { periodStart: 'desc' } },
      contentItems: { orderBy: { scheduledAt: 'asc' } },
    },
  })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await req.json()
  const data = {
    ...raw,
    monthlyRate:   raw.monthlyRate   !== undefined ? (raw.monthlyRate   === '' || raw.monthlyRate   === null ? null : parseFloat(raw.monthlyRate))   : undefined,
    paymentDueDay: raw.paymentDueDay !== undefined ? (raw.paymentDueDay === '' || raw.paymentDueDay === null ? null : parseInt(raw.paymentDueDay))   : undefined,
    portalEnabled: raw.portalEnabled !== undefined ? Boolean(raw.portalEnabled) : undefined,
  }
  const client = await prisma.client.update({ where: { id }, data })
  return NextResponse.json(client)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.client.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
