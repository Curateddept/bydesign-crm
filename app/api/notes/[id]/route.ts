import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const note = await prisma.clientNote.update({ where: { id }, data })
  return NextResponse.json(note)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.clientNote.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
