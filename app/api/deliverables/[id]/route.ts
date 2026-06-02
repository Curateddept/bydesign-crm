import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const data    = await req.json()

  const existing = await prisma.deliverable.findUnique({
    where: { id },
    include: { client: { select: { name: true } } },
  })

  const deliverable = await prisma.deliverable.update({
    where: { id },
    data,
    include: { client: { select: { name: true } } },
  })

  const clientName = (deliverable as any).client?.name

  if (deliverable.dueDate) {
    if (existing?.gcalEventId) {
      // Update existing calendar event
      await updateCalendarEvent(existing.gcalEventId, {
        title:      deliverable.title,
        notes:      deliverable.notes,
        dueDate:    deliverable.dueDate,
        dueTime:    deliverable.dueTime,
        type:       deliverable.type,
        platform:   deliverable.platform,
        clientName,
      })
    } else {
      // No event yet — create one now (due date may have just been added)
      const eventId = await createCalendarEvent({
        title:      deliverable.title,
        notes:      deliverable.notes,
        dueDate:    deliverable.dueDate,
        dueTime:    deliverable.dueTime,
        type:       deliverable.type,
        platform:   deliverable.platform,
        clientName,
      })
      if (eventId) {
        await prisma.deliverable.update({
          where: { id },
          data:  { gcalEventId: eventId },
        })
      }
    }
  }

  return NextResponse.json(deliverable)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const existing = await prisma.deliverable.findUnique({ where: { id } })
  await prisma.deliverable.delete({ where: { id } })

  if (existing?.gcalEventId) {
    await deleteCalendarEvent(existing.gcalEventId)
  }

  return NextResponse.json({ ok: true })
}
