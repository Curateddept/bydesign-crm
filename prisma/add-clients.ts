import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as any)

const clients = [
  { name: 'BenchMark',        monthlyRate: 1500 },
  { name: 'Kia',              monthlyRate: 2600 },
  { name: 'GMC',              monthlyRate: 1650 },
  { name: 'Brenthel',         monthlyRate: 1750 },
  { name: 'Bajakits',         monthlyRate: 1500 },
  { name: 'Twisted',          monthlyRate: 1550 },
  { name: 'Complete Trailers', monthlyRate: 2100 },
  { name: 'North County Ford', monthlyRate: 1700 },
  { name: 'Canvas MX',        monthlyRate: 1050 },
  { name: 'Random',           monthlyRate: 1000 },
  { name: 'Desert Vikings',   monthlyRate: 950  },
  { name: 'Jim Campbell',     monthlyRate: 950  },
  { name: 'Brenthel Snow',    monthlyRate: 800  },
  { name: 'Fiberwerx',        monthlyRate: 2000 },
  { name: 'Hattrck',          monthlyRate: 1900 },
]

async function main() {
  let added = 0
  for (const c of clients) {
    const existing = await prisma.client.findFirst({ where: { name: c.name } })
    if (existing) {
      console.log(`⚠ Already exists: ${c.name} — skipping`)
      continue
    }
    await prisma.client.create({
      data: {
        name: c.name,
        monthlyRate: c.monthlyRate,
        status: 'active',
        paymentDueDay: 1,
        portalEnabled: false,
      },
    })
    console.log(`✓ Added: ${c.name} — $${c.monthlyRate}/mo`)
    added++
  }
  console.log(`\nDone. ${added} clients added.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
