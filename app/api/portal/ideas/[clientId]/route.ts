import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — client's own submitted ideas only (never internal agency notes)
export async function GET(_: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const notes = await prisma.clientNote.findMany({
    where: { clientId, type: 'client_idea' },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes)
}

// POST — client submits a new idea or request
export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const note = await prisma.clientNote.create({
    data: {
      clientId,
      content: content.trim(),
      type: 'client_idea',
      status: 'open',
      priority: 'normal',
    },
  })
  return NextResponse.json(note, { status: 201 })
}
