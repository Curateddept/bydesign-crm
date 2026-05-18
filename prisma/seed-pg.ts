import 'dotenv/config'
import { Client } from 'pg'

const CLIENTS = [
  { id:'cmobsz3f000002evunlyf10j2', name:'BenchMark',         monthlyRate:1500,  paymentDueDay:1, portalEnabled:true,  portalPin:'3333' },
  { id:'cmobsz3f300012evux1v0j850', name:'Kia',                monthlyRate:2600,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f400022evuq2b7rcus', name:'GMC',                monthlyRate:1650,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f500032evu88a3pwni', name:'Brenthel',           monthlyRate:1750,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f500042evuzkm2eou4', name:'Bajakits',           monthlyRate:1500,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f600052evufuivtcy7', name:'Twisted',            monthlyRate:1200,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f600062evu4pmdtoe3', name:'Complete Trailers',  monthlyRate:1400,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f700072evuqbct97s1', name:'North County Ford',  monthlyRate:2000,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f700082evu2bfndep6', name:'Canvas MX',          monthlyRate:1100,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f800092evubuhqtgmf', name:'Random',             monthlyRate:500,   paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3f9000c2evumo16w3mn', name:'Brenthel Snow',      monthlyRate:1750,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3fa000d2evum2jlu1sg', name:'Fiberwerx',          monthlyRate:1300,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmobsz3fa000e2evuw1dsul3s', name:'Hattrck',            monthlyRate:1600,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmocb7omo0002kyvutdd09o81', name:'No Fear',            monthlyRate:1800,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmoem5cnr0005kyvui1nkwsuh', name:"That Ain't Bad",     monthlyRate:900,   paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmp2bj3zi0001crithuzs8ovd', name:'Gerard Lopez',       monthlyRate:1500,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmp2bjpgo0002critassfpkvg', name:'Kirk Harkey Racing',  monthlyRate:1200, paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmp2blp8d0003critgdxlntr3', name:'CW2 Store',          monthlyRate:2200,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmp2bs0bt0006critzq53jfbf', name:'MS27',               monthlyRate:1500,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmp2bsazu0007critvf9070fq', name:'JCoop34',            monthlyRate:1400,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
  { id:'cmp2bsqux0008critzzv6a324', name:'SMX Jerseys',        monthlyRate:1800,  paymentDueDay:1, portalEnabled:false, portalPin:null   },
]

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log('🌱 Seeding database...')

  for (const c of CLIENTS) {
    await client.query(`
      INSERT INTO "Client" (id, name, status, "monthlyRate", "paymentDueDay", "portalEnabled", "portalPin", "createdAt", "updatedAt")
      VALUES ($1, $2, 'active', $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        "monthlyRate" = EXCLUDED."monthlyRate",
        "paymentDueDay" = EXCLUDED."paymentDueDay",
        "portalEnabled" = EXCLUDED."portalEnabled",
        "portalPin" = EXCLUDED."portalPin",
        "updatedAt" = NOW()
    `, [c.id, c.name, c.monthlyRate, c.paymentDueDay, c.portalEnabled, c.portalPin])
    console.log(`  ✓ ${c.name}`)
  }

  console.log(`✅ ${CLIENTS.length} clients seeded`)
  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
