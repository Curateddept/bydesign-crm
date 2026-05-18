import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const data = await req.json()
  const contract = await prisma.contract.create({ data })
  return NextResponse.json(contract, { status: 201 })
}
