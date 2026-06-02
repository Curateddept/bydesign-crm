import { google } from 'googleapis'
import { prisma } from './prisma'

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI  = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/google-calendar/callback`
  : 'https://bydesign-crm.vercel.app/api/auth/google-calendar/callback'

export function getOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
}

export function getAuthUrl() {
  const client = getOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  })
}

async function getAuthedClient() {
  const setting = await prisma.setting.findUnique({ where: { key: 'google_refresh_token' } })
  if (!setting?.value) return null

  const client = getOAuthClient()
  client.setCredentials({ refresh_token: setting.value })
  return client
}

// ─── Create a calendar event for a deliverable ────────────────────────────────

export async function createCalendarEvent(deliverable: {
  id: string
  title: string
  notes?: string | null
  dueDate?: string | null
  platform?: string | null
  type?: string | null
  clientName?: string
}): Promise<string | null> {
  if (!deliverable.dueDate) return null

  const auth = await getAuthedClient()
  if (!auth) return null

  const calendar = google.calendar({ version: 'v3', auth })

  // Use the due date as an all-day event
  const dateStr = deliverable.dueDate.split('T')[0]
  const nextDay  = new Date(dateStr + 'T12:00:00')
  nextDay.setDate(nextDay.getDate() + 1)
  const nextDayStr = nextDay.toISOString().split('T')[0]

  const summary = deliverable.clientName
    ? `[${deliverable.clientName}] ${deliverable.title}`
    : deliverable.title

  const descLines = [
    deliverable.type     ? `Type: ${deliverable.type}` : null,
    deliverable.platform ? `Platform: ${deliverable.platform}` : null,
    deliverable.notes    ? `Notes: ${deliverable.notes}` : null,
    `\nManage in ByDesign CRM: ${process.env.NEXT_PUBLIC_URL || 'https://bydesign-crm.vercel.app'}`,
  ].filter(Boolean).join('\n')

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description: descLines,
        start: { date: dateStr },
        end:   { date: nextDayStr },
        colorId: '6', // Tangerine (orange) for CRM tasks
        source: {
          title: 'ByDesign CRM',
          url: `${process.env.NEXT_PUBLIC_URL || 'https://bydesign-crm.vercel.app'}/todos`,
        },
      },
    })
    return res.data.id || null
  } catch (e) {
    console.error('Google Calendar createEvent error:', e)
    return null
  }
}

// ─── Update an existing event ─────────────────────────────────────────────────

export async function updateCalendarEvent(
  eventId: string,
  deliverable: { title: string; notes?: string | null; dueDate?: string | null; platform?: string | null; type?: string | null; clientName?: string }
): Promise<void> {
  if (!deliverable.dueDate) return

  const auth = await getAuthedClient()
  if (!auth) return

  const calendar = google.calendar({ version: 'v3', auth })
  const dateStr  = deliverable.dueDate.split('T')[0]
  const nextDay  = new Date(dateStr + 'T12:00:00')
  nextDay.setDate(nextDay.getDate() + 1)
  const nextDayStr = nextDay.toISOString().split('T')[0]

  const summary = deliverable.clientName
    ? `[${deliverable.clientName}] ${deliverable.title}`
    : deliverable.title

  try {
    await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: {
        summary,
        description: [deliverable.type ? `Type: ${deliverable.type}` : null, deliverable.platform ? `Platform: ${deliverable.platform}` : null, deliverable.notes ? `Notes: ${deliverable.notes}` : null].filter(Boolean).join('\n'),
        start: { date: dateStr },
        end:   { date: nextDayStr },
        colorId: '6',
      },
    })
  } catch (e) {
    console.error('Google Calendar updateEvent error:', e)
  }
}

// ─── Delete an event ──────────────────────────────────────────────────────────

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = await getAuthedClient()
  if (!auth) return

  const calendar = google.calendar({ version: 'v3', auth })
  try {
    await calendar.events.delete({ calendarId: 'primary', eventId })
  } catch (e) {
    console.error('Google Calendar deleteEvent error:', e)
  }
}
