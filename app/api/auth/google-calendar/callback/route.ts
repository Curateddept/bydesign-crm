import { NextRequest, NextResponse } from 'next/server'
import { getOAuthClient } from '@/lib/google-calendar'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(new URL('/?gcal=error', req.url))
  }

  try {
    const client = getOAuthClient()
    const { tokens } = await client.getToken(code)

    if (!tokens.refresh_token) {
      // No refresh token — user needs to re-auth with prompt=consent
      return NextResponse.redirect(new URL('/?gcal=no_refresh_token', req.url))
    }

    // Save the refresh token to the database
    await prisma.setting.upsert({
      where:  { key: 'google_refresh_token' },
      update: { value: tokens.refresh_token },
      create: { key: 'google_refresh_token', value: tokens.refresh_token },
    })

    return NextResponse.redirect(new URL('/?gcal=connected', req.url))
  } catch (e) {
    console.error('Google Calendar OAuth callback error:', e)
    return NextResponse.redirect(new URL('/?gcal=error', req.url))
  }
}
