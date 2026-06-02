import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/google-calendar'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const deliverables = await prisma.deliverable.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { dueDate: 'asc' },
    include: { client: { select: { name: true } } },
  })
  return NextResponse.json(deliverables)
}

export async function POST(req: NextRequest) {
  const data = await req.json()

  const deliverable = await prisma.deliverable.create({
    data,
    include: { client: { select: { name: true } } },
  })

  // Auto-sync to Google Calendar when a due date is set
  if (deliverable.dueDate) {
    const eventId = await createCalendarEvent({
      title:      deliverable.title,
      notes:      deliverable.notes,
      dueDate:    deliverable.dueDate,
      dueTime:    deliverable.dueTime,
      type:       deliverable.type,
      platform:   deliverable.platform,
      clientName: (deliverable as any).client?.name,
    })
    if (eventId) {
      await prisma.deliverable.update({
        where: { id: deliverable.id },
        data:  { gcalEventId: eventId },
      })
    }
  }

  return NextResponse.json(deliverable, { status: 201 })
}
