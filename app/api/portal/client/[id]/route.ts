import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Returns live client data for an authenticated portal session (no PIN re-check — session already validated at login)
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id, portalEnabled: true },
    include: {
      contentItems: { orderBy: { scheduledAt: 'asc' } },
      analytics:    { orderBy: { periodStart: 'desc' }, take: 6 },
      contracts:    { where: { status: 'active' } },
      deliverables: {
        orderBy: { dueDate: 'asc' },
        include: { subTasks: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })

  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Strip sensitive fields before returning to client
  const { notes: _n, portalPin: _p, email: _e, phone: _ph, ...safeClient } = client as any
  return NextResponse.json(safeClient)
}
