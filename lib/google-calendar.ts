import { google } from 'googleapis'
import { prisma } from './prisma'

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI  = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/google-calendar/callback`
  : 'https://bydesign-crm.vercel.app/api/auth/google-calendar/callback'

// Albert's calendar
const CALENDAR_ID = 'albert@4thosewhocreate.com'
const TIME_ZONE   = 'America/Los_Angeles'

export function getOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
}

export function getAuthUrl() {
  const client = getOAuthClient()
  return client.generateAuthUrl({
    access_type:  'offline',
    prompt:       'consent',
    login_hint:   'albert@4thosewhocreate.com',  // force correct account
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

// ─── Build event body ─────────────────────────────────────────────────────────

function buildEvent(d: {
  title:      string
  notes?:     string | null
  dueDate:    string
  dueTime?:   string | null
  type?:      string | null
  platform?:  string | null
  clientName?: string
}) {
  // Summary: "Client Name — Task Title"
  const summary = d.clientName ? `${d.clientName} — ${d.title}` : d.title

  // Description: task details
  const descLines = [
    `Task: ${d.title}`,
    d.type     ? `Type: ${d.type}`         : null,
    d.platform ? `Platform: ${d.platform}` : null,
    d.notes    ? `\nDetails:\n${d.notes}`  : null,
    `\n— ByDesign CRM`,
  ].filter(Boolean).join('\n')

  const dateStr = d.dueDate.split('T')[0]   // YYYY-MM-DD

  if (d.dueTime) {
    // Timed event
    const start = `${dateStr}T${d.dueTime}:00`
    // Default 1-hour block
    const [h, m] = d.dueTime.split(':').map(Number)
    const endH = String(h + 1).padStart(2, '0')
    const end  = `${dateStr}T${endH}:${String(m).padStart(2, '0')}:00`
    return {
      summary,
      description: descLines,
      start: { dateTime: start, timeZone: TIME_ZONE },
      end:   { dateTime: end,   timeZone: TIME_ZONE },
      colorId: '6', // Tangerine / orange
    }
  } else {
    // All-day event
    const nextDay = new Date(dateStr + 'T12:00:00')
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    return {
      summary,
      description: descLines,
      start: { date: dateStr },
      end:   { date: nextDayStr },
      colorId: '6',
    }
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createCalendarEvent(d: {
  title:      string
  notes?:     string | null
  dueDate?:   string | null
  dueTime?:   string | null
  type?:      string | null
  platform?:  string | null
  clientName?: string
}): Promise<string | null> {
  if (!d.dueDate) return null
  const auth = await getAuthedClient()
  if (!auth) return null

  try {
    const calendar = google.calendar({ version: 'v3', auth })
    const res = await calendar.events.insert({
      calendarId:  CALENDAR_ID,
      requestBody: buildEvent({ ...d, dueDate: d.dueDate }),
    })
    return res.data.id || null
  } catch (e) {
    console.error('GCal create error:', e)
    return null
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateCalendarEvent(eventId: string, d: {
  title:      string
  notes?:     string | null
  dueDate?:   string | null
  dueTime?:   string | null
  type?:      string | null
  platform?:  string | null
  clientName?: string
}): Promise<void> {
  if (!d.dueDate) return
  const auth = await getAuthedClient()
  if (!auth) return

  try {
    const calendar = google.calendar({ version: 'v3', auth })
    await calendar.events.update({
      calendarId:  CALENDAR_ID,
      eventId,
      requestBody: buildEvent({ ...d, dueDate: d.dueDate }),
    })
  } catch (e) {
    console.error('GCal update error:', e)
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = await getAuthedClient()
  if (!auth) return
  try {
    const calendar = google.calendar({ version: 'v3', auth })
    await calendar.events.delete({ calendarId: CALENDAR_ID, eventId })
  } catch (e) {
    console.error('GCal delete error:', e)
  }
}
