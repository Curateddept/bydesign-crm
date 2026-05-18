'use client'
import { useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const PLATFORMS = ['Instagram','TikTok','Facebook','Twitter/X','YouTube','LinkedIn']
const blank = { platform:'Instagram', periodStart:'', periodEnd:'', followers:'', followersGrowth:'', reach:'', impressions:'', engagementRate:'', likes:'', comments:'', shares:'', saves:'', notes:'' }

const CustomTooltip = ({ active, payload, label }:any) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'#0f1528', border:'1px solid #1c1c1c', borderRadius:4, padding:'10px 14px', fontSize:11 }}>
      <div style={{ color:'#555', marginBottom:6 }}>{label}</div>
      {payload.map((p:any) => (
        <div key={p.name} style={{ color:p.color, display:'flex', gap:10, justifyContent:'space-between' }}>
          <span>{p.name}</span><span style={{ fontWeight:700 }}>{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsTab({ client, onRefresh }:{ client:any; onRefresh:()=>void }) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string|null>(null)
  const [form, setForm] = useState({...blank})
  const [filterPlatform, setFilterPlatform] = useState('all')
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const all:any[] = client.analytics || []
  const entries = all.filter(e=> filterPlatform==='all'||e.platform===filterPlatform)
  const platforms = [...new Set(all.map(e=>e.platform))]

  const n = (v:string) => v?parseInt(v):null
  const nf = (v:string) => v?parseFloat(v):null

  const save = async () => {
    if (!form.periodStart||!form.periodEnd) return alert('Period dates required')
    const payload = { ...form, clientId:client.id, followers:n(form.followers), followersGrowth:n(form.followersGrowth), reach:n(form.reach), impressions:n(form.impressions), engagementRate:nf(form.engagementRate), likes:n(form.likes), comments:n(form.comments), shares:n(form.shares), saves:n(form.saves) }
    if (editing) {
      await fetch(`/api/analytics/${editing}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setEditing(null)
    } else {
      await fetch('/api/analytics',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setAdding(false)
    }
    setForm({...blank}); onRefresh()
  }

  const del = async (id:string) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/analytics/${id}`,{ method:'DELETE' }); onRefresh()
  }

  const startEdit = (e:any) => {
    setForm({ platform:e.platform, periodStart:e.periodStart||'', periodEnd:e.periodEnd||'', followers:e.followers?.toString()||'', followersGrowth:e.followersGrowth?.toString()||'', reach:e.reach?.toString()||'', impressions:e.impressions?.toString()||'', engagementRate:e.engagementRate?.toString()||'', likes:e.likes?.toString()||'', comments:e.comments?.toString()||'', shares:e.shares?.toString()||'', saves:e.saves?.toString()||'', notes:e.notes||'' })
    setEditing(e.id); setAdding(false)
  }

  // Chart data — sorted chronologically
  const chartData = [...entries].sort((a,b)=>a.periodStart.localeCompare(b.periodStart)).map(e=>({
    period: e.periodStart ? new Date(e.periodStart).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '',
    followers: e.followers||0,
    reach: e.reach||0,
    engagement: e.engagementRate||0,
    likes: e.likes||0,
  }))

  // Latest stats
  const latest = entries[0]

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Analytics</span>
          <div style={{ display:'flex', gap:6 }}>
            {['all',...platforms].map((p:any)=>(
              <button key={p} onClick={()=>setFilterPlatform(p)} className={`chip ${filterPlatform===p?'chip-blue':'chip-gray'}`} style={{ cursor:'pointer', border:'none' }}>{p}</button>
            ))}
          </div>
        </div>
        <button onClick={()=>{ setAdding(true); setEditing(null); setForm({...blank}) }} className="btn btn-primary btn-sm">+ ADD ENTRY</button>
      </div>

      {/* Snapshot stats */}
      {latest && (
        <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:20 }}>
          {[
            ['Followers', latest.followers?.toLocaleString(), '#ffffff'],
            ['Growth', latest.followersGrowth!=null?(latest.followersGrowth>=0?'+':'')+latest.followersGrowth:null, latest.followersGrowth>=0?'#00ff88':'#ff3366'],
            ['Reach', latest.reach?.toLocaleString(), '#7c3aed'],
            ['Engagement', latest.engagementRate!=null?`${latest.engagementRate}%`:null, '#ffb800'],
            ['Impressions', latest.impressions?.toLocaleString(), '#ffffff'],
          ].filter(([,v])=>v!=null).map(([l,v,c])=>(
            <div key={l as string} className="hud-card animate-fadeUp" style={{ padding:'14px 16px' }}>
              <div className="label" style={{ marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:22, fontWeight:800, color:c as string }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {chartData.length > 1 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
          <div className="hud-card" style={{ padding:'18px 20px' }}>
            <div className="label" style={{ marginBottom:14 }}>Follower Growth</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                <XAxis dataKey="period" tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="followers" stroke="#ffffff" strokeWidth={2} fill="url(#gF)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="hud-card" style={{ padding:'18px 20px' }}>
            <div className="label" style={{ marginBottom:14 }}>Reach & Likes</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                <XAxis dataKey="period" tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#444', fontSize:9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="reach" fill="#7c3aed" radius={[2,2,0,0]} maxBarSize={20} />
                <Bar dataKey="likes" fill="#ffffff" radius={[2,2,0,0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Form */}
      {(adding||editing) && (
        <div className="hud-card" style={{ padding:22, marginBottom:20, borderColor:'rgba(255,255,255,0.2)' }}>
          <div className="label" style={{ marginBottom:14 }}>{editing?'Edit Entry':'New Analytics Entry'}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <F label="Platform"><select value={form.platform} onChange={e=>set('platform',e.target.value)} className="input">{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select></F>
              <F label="Period Start *"><input value={form.periodStart} onChange={e=>set('periodStart',e.target.value)} type="date" className="input" /></F>
              <F label="Period End *"><input value={form.periodEnd} onChange={e=>set('periodEnd',e.target.value)} type="date" className="input" /></F>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              <F label="Followers"><input value={form.followers} onChange={e=>set('followers',e.target.value)} type="number" placeholder="0" className="input" /></F>
              <F label="Growth +/-"><input value={form.followersGrowth} onChange={e=>set('followersGrowth',e.target.value)} type="number" placeholder="0" className="input" /></F>
              <F label="Reach"><input value={form.reach} onChange={e=>set('reach',e.target.value)} type="number" placeholder="0" className="input" /></F>
              <F label="Impressions"><input value={form.impressions} onChange={e=>set('impressions',e.target.value)} type="number" placeholder="0" className="input" /></F>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
              <F label="Engagement %"><input value={form.engagementRate} onChange={e=>set('engagementRate',e.target.value)} type="number" step="0.01" placeholder="0.00" className="input" /></F>
              <F label="Likes"><input value={form.likes} onChange={e=>set('likes',e.target.value)} type="number" placeholder="0" className="input" /></F>
              <F label="Comments"><input value={form.comments} onChange={e=>set('comments',e.target.value)} type="number" placeholder="0" className="input" /></F>
              <F label="Shares"><input value={form.shares} onChange={e=>set('shares',e.target.value)} type="number" placeholder="0" className="input" /></F>
              <F label="Saves"><input value={form.saves} onChange={e=>set('saves',e.target.value)} type="number" placeholder="0" className="input" /></F>
            </div>
            <F label="Notes"><input value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Notes about this period..." className="input" /></F>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={save} className="btn btn-primary btn-sm">SAVE</button>
              <button onClick={()=>{ setAdding(false); setEditing(null) }} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Entries list */}
      {entries.length===0&&!adding ? (
        <div className="hud-card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:28, color:'#222', marginBottom:10 }}>◬</div>
          <div style={{ color:'#444', fontSize:13 }}>No analytics data yet. Log weekly metrics to see trends.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {entries.map(e=>(
            <div key={e.id} className="hud-card" style={{ padding:'18px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                    <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{e.platform}</span>
                    <span style={{ fontSize:11, color:'#444' }}>
                      {new Date(e.periodStart).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – {new Date(e.periodEnd).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </span>
                    {e.followersGrowth!=null&&e.followersGrowth>0&&<span className="chip chip-green">+{e.followersGrowth} growth</span>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:16 }}>
                    {[['Followers',e.followers,'#ffffff'],['Growth',e.followersGrowth!=null?(e.followersGrowth>=0?'+':'')+e.followersGrowth:null,e.followersGrowth>=0?'#00ff88':'#ff3366'],['Reach',e.reach,'#7c3aed'],['Impressions',e.impressions,'#555'],['Engagement',e.engagementRate!=null?`${e.engagementRate}%`:null,'#ffb800'],['Likes',e.likes,'#ffffff'],['Comments',e.comments,'#555'],['Shares',e.shares,'#555'],['Saves',e.saves,'#555']].filter(([,v])=>v!=null).map(([l,v,c])=>(
                      <div key={l as string}>
                        <div className="label" style={{ marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:20, fontWeight:800, color:c as string, fontVariantNumeric:'tabular-nums' }}>{typeof v==='number'?v.toLocaleString():v}</div>
                      </div>
                    ))}
                  </div>
                  {e.notes&&<div style={{ marginTop:12, fontSize:12, color:'#444', borderTop:'1px solid #111', paddingTop:10 }}>{e.notes}</div>}
                </div>
                <div style={{ display:'flex', gap:6, marginLeft:16 }}>
                  <button onClick={()=>startEdit(e)} className="btn btn-ghost btn-sm">Edit</button>
                  <button onClick={()=>del(e.id)} className="btn btn-danger btn-sm">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return <div><label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>{children}</div>
}
