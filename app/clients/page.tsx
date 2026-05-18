'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => { setClients(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const filtered = clients.filter(c => {
    const ms = filter === 'all' || c.status === filter
    const mq = c.name.toLowerCase().includes(search.toLowerCase()) || (c.company||'').toLowerCase().includes(search.toLowerCase())
    return ms && mq
  })

  const monthlyRevenue = clients.filter(c=>c.status==='active').reduce((s,c)=>s+(c.monthlyRate||0),0)

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Client Roster</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Clients</h1>
          <p style={{ color: '#555', fontSize: 12, marginTop: 4 }}>{clients.filter(c=>c.status==='active').length} active · ${monthlyRevenue.toLocaleString()}/mo revenue</p>
        </div>
        <Link href="/clients/new" className="btn btn-primary">+ NEW CLIENT</Link>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <input placeholder="Search clients..." value={search} onChange={e=>setSearch(e.target.value)}
          className="input" style={{ maxWidth: 280 }} />
        {['all','active','paused','churned'].map(s => (
          <button key={s} onClick={()=>setFilter(s)} className={`btn ${filter===s?'btn-primary':'btn-ghost'}`}
            style={{ textTransform: 'capitalize', fontSize: 11 }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding: 60, color:'#333' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding: 60 }}>
          <div style={{ fontSize:32, marginBottom:12, color:'#222' }}>◉</div>
          <div style={{ color:'#444', fontSize:13 }}>
            {clients.length===0 ? <><Link href="/clients/new" style={{ color:'#ffffff', textDecoration:'none' }}>Add your first client</Link> to get started</> : 'No clients match your search'}
          </div>
        </div>
      ) : (
        <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {filtered.map(client => {
            const statusColor = client.status==='active'?'#00ff88':client.status==='paused'?'#ffb800':'#ff3366'
            const today = new Date().getDate()
            const paymentDue = client.paymentDueDay && Math.abs(today - client.paymentDueDay) <= 3
            return (
              <Link key={client.id} href={`/clients/${client.id}`}
                className="hud-card animate-fadeUp"
                style={{ padding:'20px 22px', textDecoration:'none', display:'block' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:3, background:'#131b2e', border:`1px solid ${statusColor}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:statusColor }}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:'#fff', letterSpacing:'-0.01em' }}>{client.name}</div>
                      {client.company && <div style={{ fontSize:11, color:'#555', marginTop:1 }}>{client.company}</div>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span className={`status-dot ${client.status}`} />
                  </div>
                </div>

                {/* Platforms */}
                <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
                  {client.instagram && <span className="chip chip-gray">IG</span>}
                  {client.tiktok    && <span className="chip chip-gray">TT</span>}
                  {client.facebook  && <span className="chip chip-gray">FB</span>}
                  {client.twitter   && <span className="chip chip-gray">X</span>}
                  {client.youtube   && <span className="chip chip-gray">YT</span>}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  {client.monthlyRate
                    ? <span style={{ fontSize:16, fontWeight:800, color:'#00ff88', letterSpacing:'-0.01em' }}>${client.monthlyRate.toLocaleString()}<span style={{ fontSize:10, color:'#444', fontWeight:400 }}>/mo</span></span>
                    : <span style={{ fontSize:12, color:'#333' }}>No rate set</span>
                  }
                  {paymentDue && <span className="chip chip-yellow">Payment Due</span>}
                  {client._count && <span style={{ fontSize:10, color:'#444' }}>{client._count.contentItems} posts</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
