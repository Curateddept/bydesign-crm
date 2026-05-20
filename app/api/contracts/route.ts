import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const raw = await req.json()
  const data = {
    ...raw,
    value: raw.value !== undefined ? (raw.value === '' || raw.value === null ? null : parseFloat(raw.value)) : undefined,
  }
  const contract = await prisma.contract.create({ data })
  return NextResponse.json(contract, { status: 201 })
}
