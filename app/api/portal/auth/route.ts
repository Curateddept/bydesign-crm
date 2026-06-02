import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { username, pin } = await req.json()
  if (!username || !pin) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })

  const client = await prisma.client.findFirst({
    where: { name: { equals: username.trim(), mode: 'insensitive' }, portalEnabled: true },
    include: {
      contentItems: { orderBy: { dayOfWeek: 'asc' } },
      analytics:    { orderBy: { periodStart: 'desc' }, take: 6 },
      contracts:    { where: { status: 'active' } },
      deliverables: { orderBy: { dueDate: 'asc' }, include: { subTasks: { orderBy: { createdAt: 'asc' } } } },
    },
  })

  if (!client) return NextResponse.json({ error: 'Invalid username or PIN' }, { status: 401 })
  if (client.portalPin !== pin) return NextResponse.json({ error: 'Invalid username or PIN' }, { status: 401 })

  const { notes: _n, portalPin: _p, ...safeClient } = client as any
  return NextResponse.json(safeClient)
}
