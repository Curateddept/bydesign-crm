import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const contacts = await prisma.emailContact.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  if (!data.email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  const contact = await prisma.emailContact.create({ data })
  return NextResponse.json(contact, { status: 201 })
}
