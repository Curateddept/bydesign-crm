import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const subTask = await prisma.subTask.update({ where: { id }, data })
  return NextResponse.json(subTask)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.subTask.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
