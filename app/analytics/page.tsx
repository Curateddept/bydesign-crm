'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const CustomTip = ({ active, payload, label }:any) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#0f1528', border:'1px solid #1c1c1c', borderRadius:4, padding:'8px 12px', fontSize:11 }}>
      <div style={{ color:'#555', marginBottom:4 }}>{label}</div>
      {payload.map((p:any)=><div key={p.name} style={{ color:p.color }}>{p.name}: <b>{Number(p.value).toLocaleString()}</b></div>)}
    </div>
  )
}

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClient, setFilterClient] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')

  useEffect(()=>{
    Promise.all([fetch('/api/analytics').then(r=>r.json()), fetch('/api/clients').then(r=>r.json())]).then(([a,c])=>{
      setEntries(Array.isArray(a)?a:[]); setClients(Array.isArray(c)?c:[]); setLoading(false)
    })
  },[])

  const platforms = [...new Set(entries.map(e=>e.platform).filter(Boolean))]
  const filtered = entries.filter(e=>{
    const mc = filterClient==='all'||e.clientId===filterClient
    const mp = filterPlatform==='all'||e.platform===filterPlatform
    return mc&&mp
  })

  const chartData = [...filtered].sort((a,b)=>a.periodStart.localeCompare(b.periodStart)).map(e=>({
    period: new Date(e.periodStart).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
    followers: e.followers||0, reach: e.reach||0, engagement: e.engagementRate||0,
    client: e.client?.name||''
  }))

  const totFollowers = filtered.reduce((s,e)=>s+(e.followers||0),0)
  const avgEngagement = filtered.length ? (filtered.reduce((s,e)=>s+(e.engagementRate||0),0)/filtered.length).toFixed(2) : '0'
  const totReach = filtered.reduce((s,e)=>s+(e.reach||0),0)

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#333' }}>Loading...</div>

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div className="label" style={{ marginBottom:6 }}>Performance Intelligence</div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>Analytics</h1>
          <p style={{ color:'#555', fontSize:12, marginTop:4 }}>{filtered.length} data points · All client metrics</p>
        </div>
        <span className="live-badge">Manual Entry</span>
      </div>

      {/* Connect socials notice */}
      <div style={{ padding:'14px 18px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:4, marginBottom:22, display:'flex', alignItems:'center', gap:14 }}>
        <span style={{ fontSize:18 }}>⚡</span>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'#ffffff', marginBottom:2 }}>Connect Social Accounts</div>
          <div style={{ fontSize:11, color:'#555' }}>Log metrics manually below or connect Instagram, TikTok, Facebook via their APIs for auto-tracking. Contact your developer to enable API connections.</div>
        </div>
      </div>

      {/* Summary stats */}
      {filtered.length>0&&(
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          {[['Total Followers','#ffffff',totFollowers.toLocaleString()],['Avg Engagement','#ffb800',`${avgEngagement}%`],['Total Reach','#7c3aed',totReach.toLocaleString()]].map(([l,c,v])=>(
            <div key={l as string} className="hud-card" style={{ padding:'16px 20px' }}>
              <div className="label" style={{ marginBottom:8 }}>{l}</div>
              <div style={{ fontSize:28, fontWeight:900, color:c as string }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        <select value={filterClient} onChange={e=>setFilterClient(e.target.value)} className="input" style={{ maxWidth:200 }}>
          <option value="all">All Clients</option>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterPlatform} onChange={e=>setFilterPlatform(e.target.value)} className="input" style={{ maxWidth:180 }}>
          <option value="all">All Platforms</option>
          {platforms.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Charts */}
      {chartData.length>1&&(
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
          <div className="hud-card" style={{ padding:'18px 20px' }}>
            <div className="label" style={{ marginBottom:14 }}>Follower Trend</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f0f0f" />
                <XAxis dataKey="period" tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Area type="monotone" dataKey="followers" name="Followers" stroke="#ffffff" strokeWidth={2} fill="url(#gA)" dot={{ fill:'#ffffff', r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="hud-card" style={{ padding:'18px 20px' }}>
            <div className="label" style={{ marginBottom:14 }}>Reach by Period</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f0f0f" vertical={false} />
                <XAxis dataKey="period" tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="reach" name="Reach" fill="#7c3aed" radius={[3,3,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Entries */}
      {filtered.length===0 ? (
        <div className="hud-card" style={{ padding:60, textAlign:'center' }}>
          <div style={{ fontSize:32, color:'#222', marginBottom:12 }}>◬</div>
          <div style={{ color:'#444', fontSize:13 }}>No analytics data. Add metrics from each client's Analytics tab.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(e=>(
            <div key={e.id} className="hud-card" style={{ padding:'18px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{e.platform}</span>
                  <Link href={`/clients/${e.clientId}`} style={{ fontSize:12, color:'#ffffff', textDecoration:'none', fontWeight:600 }}>{e.client?.name}</Link>
                  <span style={{ fontSize:11, color:'#444' }}>{new Date(e.periodStart).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – {new Date(e.periodEnd).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                  {e.followersGrowth>0&&<span className="chip chip-green">+{e.followersGrowth}</span>}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:16 }}>
                {[['Followers',e.followers,'#ffffff'],['Growth',e.followersGrowth!=null?(e.followersGrowth>=0?'+':'')+e.followersGrowth:null,e.followersGrowth>=0?'#00ff88':'#ff3366'],['Reach',e.reach,'#7c3aed'],['Impressions',e.impressions,'#555'],['Engagement',e.engagementRate!=null?`${e.engagementRate}%`:null,'#ffb800'],['Likes',e.likes,'#ffffff'],['Comments',e.comments,'#555'],['Shares',e.shares,'#555'],['Saves',e.saves,'#555']].filter(([,v])=>v!=null).map(([l,v,c])=>(
                  <div key={l as string}>
                    <div className="label" style={{ marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:20, fontWeight:800, color:c as string }}>{typeof v==='number'?v.toLocaleString():v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
