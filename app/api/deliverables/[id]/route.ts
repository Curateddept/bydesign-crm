import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'

function extractGcalId(notes: string | null): string | null {
  if (!notes) return null
  const match = notes.match(/\[gcal:([^\]]+)\]/)
  return match ? match[1] : null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()

  const existing = await prisma.deliverable.findUnique({
    where: { id },
    include: { client: { select: { name: true } } },
  })
  const deliverable = await prisma.deliverable.update({
    where: { id },
    data,
    include: { client: { select: { name: true } } },
  })

  // Sync update to Google Calendar if event was previously created
  const gcalId = extractGcalId(existing?.notes || null)
  if (gcalId && deliverable.dueDate) {
    await updateCalendarEvent(gcalId, {
      title:      deliverable.title,
      notes:      deliverable.notes,
      dueDate:    deliverable.dueDate,
      platform:   deliverable.platform,
      type:       deliverable.type,
      clientName: (deliverable as any).client?.name,
    })
  }

  return NextResponse.json(deliverable)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch before deleting so we can remove the calendar event
  const existing = await prisma.deliverable.findUnique({ where: { id } })
  const gcalId   = extractGcalId(existing?.notes || null)

  await prisma.deliverable.delete({ where: { id } })

  if (gcalId) await deleteCalendarEvent(gcalId)

  return NextResponse.json({ ok: true })
}
