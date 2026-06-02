import { NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/google-calendar'

// Kick off the Google OAuth flow
export async function GET() {
  const url = getAuthUrl()
  return NextResponse.redirect(url)
}
