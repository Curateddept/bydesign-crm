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

  // Sync to Google Calendar if a due date is set
  if (deliverable.dueDate) {
    const eventId = await createCalendarEvent({
      id:         deliverable.id,
      title:      deliverable.title,
      notes:      deliverable.notes,
      dueDate:    deliverable.dueDate,
      platform:   deliverable.platform,
      type:       deliverable.type,
      clientName: (deliverable as any).client?.name,
    })
    // Store the Google Calendar event ID so we can update/delete it later
    if (eventId) {
      await prisma.deliverable.update({
        where: { id: deliverable.id },
        data:  { notes: deliverable.notes ? `${deliverable.notes}\n[gcal:${eventId}]` : `[gcal:${eventId}]` },
      })
    }
  }

  return NextResponse.json(deliverable, { status: 201 })
}
