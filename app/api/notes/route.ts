import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const type     = searchParams.get('type')

  // Special filter: all client-submitted inbox messages across all clients
  const where: any = clientId ? { clientId } : {}
  if (type === 'client_inbox') {
    where.OR = [
      { type: 'client_idea' },
      { content: { startsWith: '[CLIENT FEEDBACK]' } },
    ]
  } else if (type) {
    where.type = type
  }

  const notes = await prisma.clientNote.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { client: { select: { name: true } } },
  })
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const note = await prisma.clientNote.create({ data })
  return NextResponse.json(note, { status: 201 })
}
