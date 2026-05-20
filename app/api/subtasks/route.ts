import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { deliverableId, title } = await req.json()
  if (!deliverableId || !title?.trim()) {
    return NextResponse.json({ error: 'deliverableId and title required' }, { status: 400 })
  }
  const subTask = await prisma.subTask.create({
    data: { deliverableId, title: title.trim(), done: false },
  })
  return NextResponse.json(subTask, { status: 201 })
}
