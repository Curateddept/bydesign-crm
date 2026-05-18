import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { clientId, pin } = await req.json()
  if (!clientId || !pin) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      contentItems: { orderBy: { dayOfWeek: 'asc' } },
      analytics:    { orderBy: { periodStart: 'desc' }, take: 6 },
      contracts:    { where: { status: 'active' } },
      deliverables: { orderBy: { dueDate: 'asc' } },
    },
  })

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  if (!client.portalEnabled) return NextResponse.json({ error: 'Portal not enabled' }, { status: 403 })
  if (client.portalPin !== pin) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })

  const { notes: _n, portalPin: _p, ...safeClient } = client as any
  return NextResponse.json(safeClient)
}
