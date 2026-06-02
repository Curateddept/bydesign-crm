'use client'
import { useState, useRef } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonday(d = new Date()): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1))
  r.setHours(0, 0, 0, 0)
  return r
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function toISO(d: Date) { return d.toISOString().split('T')[0] }
function fmtShort(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
}

const EMAIL_TYPES   = ['Newsletter','Promo','Announcement','Follow-Up','Welcome','Re-Engagement','Other']
const STATUS_OPTS   = ['draft','writing','designed','approved','scheduled','sent']
const STATUS_COLOR: Record<string,string> = {
  draft:'#555', writing:'#ffb800', designed:'#a855f7',
  approved:'#00ff88', scheduled:'#3b82f6', sent:'#00ff88',
}

const blankCampaign = {
  title:'', caption:'', type:'Newsletter', scheduledAt:'', postTime:'09:00',
  status:'draft', hashtags:'', strategy:'', notes:'',
}

// ─── Email Campaign Calendar ──────────────────────────────────────────────────

function CampaignCalendar({ client, onRefresh }: { client:any; onRefresh:()=>void }) {
  const [adding,       setAdding]       = useState(false)
  const [editing,      setEditing]      = useState<string|null>(null)
  const [form,         setForm]         = useState({...blankCampaign})
  const [weekStart,    setWeekStart]    = useState(() => toISO(getMonday()))
  const [selected,     setSelected]     = useState<any>(null)
  const [uploading,    setUploading]    = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{url:string;name:string;type:string}|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  // Only show email platform content items
  const allItems: any[] = (client.contentItems || []).filter((i:any) => i.platform?.toLowerCase() === 'email')
  const dates = Array.from({ length:7 }, (_,i) => toISO(addDays(new Date(weekStart+'T12:00:00'), i)))

  const byDate: Record<string,any[]> = {}
  for (const d of dates) byDate[d] = []
  for (const item of allItems) {
    const d = item.scheduledAt?.split('T')[0]
    if (d && d in byDate) byDate[d].push(item)
  }

  const shiftWeek = (dir: 1|-1) => {
    const d = new Date(weekStart+'T12:00:00')
    d.setDate(d.getDate() + dir*7)
    setWeekStart(toISO(d)); setSelected(null)
  }

  const save = async () => {
    if (!form.title.trim()) return alert('Subject / title required')
    const payload: any = {
      ...form,
      platform: 'Email',
      clientId: client.id,
      scheduledAt: form.scheduledAt ? `${form.scheduledAt}T${form.postTime||'09:00'}:00.000Z` : null,
    }
    if (uploadedFile) { payload.fileUrl=uploadedFile.url; payload.fileName=uploadedFile.name; payload.fileType=uploadedFile.type }
    if (editing) {
      await fetch(`/api/content/${editing}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setEditing(null)
    } else {
      await fetch('/api/content', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setAdding(false)
    }
    setForm({...blankCampaign}); setUploadedFile(null); setSelected(null); onRefresh()
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method:'POST', body:fd })
    const data = await res.json()
    setUploadedFile({ url:data.url, name:file.name, type:file.type })
    setUploading(false)
  }

  const startEdit = (item:any) => {
    const dateStr = item.scheduledAt?.split('T')[0] || ''
    setForm({ title:item.title, caption:item.caption||'', type:item.type||'Newsletter',
      scheduledAt:dateStr, postTime:item.postTime||'09:00', status:item.status||'draft',
      hashtags:item.hashtags||'', strategy:item.strategy||'', notes:item.notes||'' })
    if (item.fileUrl) setUploadedFile({ url:item.fileUrl, name:item.fileName||'attachment', type:item.fileType||'' })
    setEditing(item.id); setAdding(false); setSelected(null)
    if (dateStr) setWeekStart(toISO(getMonday(new Date(dateStr+'T12:00:00'))))
  }

  const del = async (id:string) => {
    if (!confirm('Delete this campaign?')) return
    await fetch(`/api/content/${id}`, { method:'DELETE' })
    setSelected(null); onRefresh()
  }

  const updateStatus = async (id:string, status:string) => {
    await fetch(`/api/content/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) })
    onRefresh()
  }

  const unscheduled = allItems.filter(i => !i.scheduledAt)

  return (
    <div>
      {/* Subheader */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#e8eeff' }}>✉️ Email Campaign Calendar</span>
          <span style={{ fontSize:11, color:'#3d4f6e' }}>{allItems.length} campaign{allItems.length!==1?'s':''}</span>
        </div>
        <button onClick={()=>{ setAdding(true); setEditing(null); setForm({...blankCampaign}); setUploadedFile(null); setSelected(null) }}
          className="btn btn-primary btn-sm">+ ADD CAMPAIGN</button>
      </div>

      {/* Add/Edit form */}
      {(adding||editing) && (
        <div className="hud-card" style={{ padding:20, marginBottom:18, borderColor:'rgba(0,232,122,0.2)' }}>
          <div className="label" style={{ marginBottom:12 }}>{editing ? 'Edit Campaign' : 'New Email Campaign'}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <F label="Subject / Title *">
              <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. June Newsletter — Summer Sale" className="input" autoFocus />
            </F>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10 }}>
              <F label="Send Date">
                <input value={form.scheduledAt} onChange={e=>set('scheduledAt',e.target.value)} type="date" className="input" />
              </F>
              <F label="Send Time">
                <input value={form.postTime} onChange={e=>set('postTime',e.target.value)} type="time" className="input" />
              </F>
              <F label="Type">
                <select value={form.type} onChange={e=>set('type',e.target.value)} className="input">
                  {EMAIL_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </F>
              <F label="Status">
                <select value={form.status} onChange={e=>set('status',e.target.value)} className="input">
                  {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
                </select>
              </F>
            </div>
            <F label="Email Body / Preview Text">
              <textarea value={form.caption} onChange={e=>set('caption',e.target.value)} placeholder="Email body or preview text..." rows={4} className="input" style={{ resize:'vertical' }} />
            </F>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <F label="Strategy / Goal">
                <input value={form.strategy} onChange={e=>set('strategy',e.target.value)} placeholder="e.g. Re-engage cold leads" className="input" />
              </F>
              <F label="Attachment / Template">
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button type="button" onClick={()=>fileRef.current?.click()} className="btn btn-ghost btn-sm">
                    {uploading ? 'Uploading…' : '📎 Upload'}
                  </button>
                  {uploadedFile && <span style={{ fontSize:11, color:'#00ff88' }}>✓ {uploadedFile.name}</span>}
                  <input ref={fileRef} type="file" accept="image/*,.pdf,.html" onChange={handleFile} style={{ display:'none' }} />
                </div>
              </F>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={save} className="btn btn-primary btn-sm">SAVE CAMPAIGN</button>
              <button onClick={()=>{ setAdding(false); setEditing(null); setUploadedFile(null) }} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Week nav */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        <button onClick={()=>shiftWeek(-1)} style={navBtn}>‹ Prev</button>
        <span style={{ fontSize:12, fontWeight:600, color:'#8a99b8' }}>{fmtShort(dates[0])} – {fmtShort(dates[6])}</span>
        <button onClick={()=>shiftWeek(1)} style={navBtn}>Next ›</button>
        <button onClick={()=>{ setWeekStart(toISO(getMonday())); setSelected(null) }} style={{ ...navBtn, fontSize:10, color:'#3d4f6e' }}>This Week</button>
      </div>

      {/* 7-day grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:16 }}>
        {dates.map(dateStr => {
          const d = new Date(dateStr+'T12:00:00')
          const posts = byDate[dateStr] || []
          const isToday = toISO(new Date()) === dateStr
          return (
            <div key={dateStr}>
              <div style={{ padding:'7px 9px', background:isToday?'#111827':'#0d1424', border:`1px solid ${isToday?'#2a3a55':'#1e2a40'}`, borderBottom:`2px solid ${posts.length>0?'#00e87a33':'#1e2a40'}`, borderRadius:'4px 4px 0 0' }}>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:isToday?'#e8eeff':'#2a3a55' }}>
                  {d.toLocaleDateString('en-US',{weekday:'short'})}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:isToday?'#fff':'#8a99b8', marginTop:1 }}>
                  {d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                </div>
                {isToday && <div style={{ fontSize:8, color:'#00e87a', fontWeight:700, marginTop:2 }}>TODAY</div>}
              </div>
              <div style={{ background:'#0a0e1a', border:'1px solid #1e2a40', borderTop:'none', borderRadius:'0 0 4px 4px', minHeight:120, padding:5, display:'flex', flexDirection:'column', gap:4 }}>
                {posts.map((item:any)=>(
                  <div key={item.id} onClick={()=>setSelected(selected?.id===item.id?null:item)}
                    style={{ padding:'6px 8px', borderRadius:3, cursor:'pointer',
                      background:selected?.id===item.id?'#161d2e':'#111827',
                      border:`1px solid ${selected?.id===item.id?'#00e87a':'#1e2a40'}`,
                      borderLeft:`3px solid ${STATUS_COLOR[item.status]||'#333'}`, transition:'all 0.15s' }}>
                    <div style={{ fontSize:9, fontWeight:700, color:'#3d4f6e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{item.type||'Email'}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#e8eeff', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                    <div style={{ fontSize:8, color:STATUS_COLOR[item.status]||'#555', fontWeight:700, textTransform:'uppercase', marginTop:3 }}>{item.status}</div>
                  </div>
                ))}
                {posts.length===0 && <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#1a2235', fontSize:16 }}>—</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected campaign detail */}
      {selected && (
        <div style={{ padding:18, background:'#111827', border:'1px solid #1e2a40', borderRadius:6, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
                <span style={{ fontSize:9, fontWeight:700, color:'#00e87a', letterSpacing:'0.1em', textTransform:'uppercase' }}>✉️ {selected.type||'Email'}</span>
                <select value={selected.status} onChange={e=>{updateStatus(selected.id,e.target.value); setSelected((s:any)=>({...s,status:e.target.value}))}}
                  style={{ fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.05)', border:'1px solid #1e2a40', borderRadius:3, color:STATUS_COLOR[selected.status]||'#fff', padding:'2px 8px', cursor:'pointer', outline:'none', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ fontSize:15, fontWeight:800, color:'#f0f4ff', marginBottom:3 }}>{selected.title}</div>
              {selected.scheduledAt && <div style={{ fontSize:11, color:'#3d4f6e' }}>{fmtShort(selected.scheduledAt.split('T')[0])} {selected.postTime ? `at ${selected.postTime}` : ''}</div>}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {selected.fileUrl && <a href={selected.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#8a99b8', textDecoration:'none', padding:'5px 10px', border:'1px solid #1e2a40', borderRadius:3 }}>📎 {selected.fileName||'Attachment'} ↗</a>}
              <button onClick={()=>startEdit(selected)} style={navBtn}>Edit</button>
              <button onClick={()=>del(selected.id)} style={{ ...navBtn, color:'#ff4466', borderColor:'rgba(255,68,102,0.3)' }}>Delete</button>
              <button onClick={()=>setSelected(null)} style={navBtn}>Close</button>
            </div>
          </div>
          {selected.caption && <div style={{ fontSize:13, color:'#8a99b8', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:selected.strategy?10:0 }}>{selected.caption}</div>}
          {selected.strategy && (
            <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid #1e2a40', borderRadius:4 }}>
              <div style={{ fontSize:9, color:'#3d4f6e', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Strategy</div>
              <div style={{ fontSize:12, color:'#555' }}>{selected.strategy}</div>
            </div>
          )}
        </div>
      )}

      {/* Unscheduled */}
      {unscheduled.length > 0 && (
        <div style={{ marginTop:8 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#2a3a55', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Unscheduled Drafts ({unscheduled.length})</div>
          <div className="hud-card" style={{ overflow:'hidden' }}>
            {unscheduled.map((item:any,i:number)=>(
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom:i<unscheduled.length-1?'1px solid #111':'none' }}>
                <div style={{ width:3, height:24, borderRadius:2, background:STATUS_COLOR[item.status]||'#333', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{item.title}</div>
                  <div style={{ fontSize:11, color:'#444' }}>{item.type}</div>
                </div>
                <select value={item.status} onChange={e=>updateStatus(item.id,e.target.value)}
                  style={{ fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.05)', border:'1px solid #1e2a40', borderRadius:3, color:STATUS_COLOR[item.status]||'#fff', padding:'3px 8px', cursor:'pointer', outline:'none' }}>
                  {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={()=>startEdit(item)} className="btn btn-ghost btn-sm">Edit</button>
                <button onClick={()=>del(item.id)} className="btn btn-danger btn-sm">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Email List Manager ───────────────────────────────────────────────────────

function EmailListManager({ client, onRefresh }: { client:any; onRefresh:()=>void }) {
  const [adding,    setAdding]    = useState(false)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [form,      setForm]      = useState({ email:'', firstName:'', lastName:'', tags:'', status:'subscribed' })
  const [search,    setSearch]    = useState('')
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const contacts: any[] = client.emailContacts || []
  const filtered = contacts.filter(c =>
    !search || c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.firstName||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.lastName||'').toLowerCase().includes(search.toLowerCase())
  )
  const subscribed   = contacts.filter(c=>c.status==='subscribed').length
  const unsubscribed = contacts.filter(c=>c.status==='unsubscribed').length

  const save = async () => {
    if (!form.email.trim()) return alert('Email required')
    if (editingId) {
      await fetch(`/api/email-contacts/${editingId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      setEditingId(null)
    } else {
      await fetch('/api/email-contacts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...form, clientId:client.id }) })
      setAdding(false)
    }
    setForm({ email:'', firstName:'', lastName:'', tags:'', status:'subscribed' }); onRefresh()
  }

  const startEdit = (c:any) => {
    setForm({ email:c.email, firstName:c.firstName||'', lastName:c.lastName||'', tags:c.tags||'', status:c.status })
    setEditingId(c.id); setAdding(false)
  }

  const toggleStatus = async (c:any) => {
    const status = c.status === 'subscribed' ? 'unsubscribed' : 'subscribed'
    await fetch(`/api/email-contacts/${c.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) })
    onRefresh()
  }

  const del = async (id:string) => {
    if (!confirm('Remove this contact?')) return
    await fetch(`/api/email-contacts/${id}`, { method:'DELETE' })
    onRefresh()
  }

  return (
    <div style={{ marginTop:32 }}>
      <div style={{ borderTop:'1px solid #1e2a40', paddingTop:24, marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#e8eeff' }}>📋 Email List</span>
            <span style={{ fontSize:10, color:'#00e87a', fontWeight:700 }}>{subscribed} subscribed</span>
            {unsubscribed > 0 && <span style={{ fontSize:10, color:'#ff4466', fontWeight:700 }}>{unsubscribed} unsubscribed</span>}
          </div>
          <button onClick={()=>{ setAdding(true); setEditingId(null); setForm({ email:'', firstName:'', lastName:'', tags:'', status:'subscribed' }) }}
            className="btn btn-primary btn-sm">+ ADD CONTACT</button>
        </div>
        <p style={{ fontSize:11, color:'#3d4f6e', margin:0 }}>Manage email subscribers for {client.name}</p>
      </div>

      {/* Add/Edit form */}
      {(adding||editingId) && (
        <div className="hud-card" style={{ padding:18, marginBottom:16, borderColor:'rgba(0,232,122,0.15)' }}>
          <div className="label" style={{ marginBottom:10 }}>{editingId?'Edit Contact':'Add Contact'}</div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <F label="Email *">
              <input value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@example.com" className="input" autoFocus type="email" />
            </F>
            <F label="First Name">
              <input value={form.firstName} onChange={e=>set('firstName',e.target.value)} placeholder="First" className="input" />
            </F>
            <F label="Last Name">
              <input value={form.lastName} onChange={e=>set('lastName',e.target.value)} placeholder="Last" className="input" />
            </F>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10, marginBottom:12 }}>
            <F label="Tags (comma separated)">
              <input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="vip, newsletter, promo" className="input" />
            </F>
            <F label="Status">
              <select value={form.status} onChange={e=>set('status',e.target.value)} className="input">
                <option value="subscribed">Subscribed</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </F>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} className="btn btn-primary btn-sm">SAVE</button>
            <button onClick={()=>{ setAdding(false); setEditingId(null) }} className="btn btn-ghost btn-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      {contacts.length > 5 && (
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"
          className="input" style={{ marginBottom:12, maxWidth:300 }} />
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="hud-card" style={{ padding:32, textAlign:'center' }}>
          <div style={{ fontSize:24, color:'#222', marginBottom:8 }}>✉️</div>
          <div style={{ color:'#444', fontSize:13 }}>{contacts.length===0 ? 'No contacts yet — add your first subscriber above.' : 'No results for that search.'}</div>
        </div>
      ) : (
        <div className="hud-card" style={{ overflow:'hidden' }}>
          {/* Header row */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:12, padding:'8px 16px', borderBottom:'1px solid #111', background:'#0a0e1a' }}>
            {['Email','First','Last','Tags',''].map((h,i)=>(
              <div key={i} style={{ fontSize:9, fontWeight:700, color:'#2a3a55', letterSpacing:'0.1em', textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {filtered.map((c:any,i:number)=>(
            <div key={c.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:12, padding:'11px 16px', alignItems:'center', borderBottom:i<filtered.length-1?'1px solid #0d0d0d':'none', transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#111827')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:c.status==='subscribed'?'#00e87a':'#ff4466', flexShrink:0 }} />
                <span style={{ fontSize:12, color:c.status==='subscribed'?'#e8eeff':'#555' }}>{c.email}</span>
              </div>
              <span style={{ fontSize:12, color:'#8a99b8' }}>{c.firstName||'—'}</span>
              <span style={{ fontSize:12, color:'#8a99b8' }}>{c.lastName||'—'}</span>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {(c.tags||'').split(',').filter(Boolean).map((t:string)=>(
                  <span key={t} style={{ fontSize:9, padding:'2px 6px', background:'rgba(99,130,255,0.1)', border:'1px solid rgba(99,130,255,0.2)', borderRadius:3, color:'#8a99b8' }}>{t.trim()}</span>
                ))}
              </div>
              <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                <button onClick={()=>toggleStatus(c)} title={c.status==='subscribed'?'Unsubscribe':'Re-subscribe'}
                  style={{ ...navBtn, fontSize:10, padding:'3px 8px', color:c.status==='subscribed'?'#3d4f6e':'#00e87a' }}>
                  {c.status==='subscribed'?'Unsub':'Resub'}
                </button>
                <button onClick={()=>startEdit(c)} className="btn btn-ghost btn-sm">Edit</button>
                <button onClick={()=>del(c.id)} className="btn btn-danger btn-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function EmailTab({ client, onRefresh }: { client:any; onRefresh:()=>void }) {
  return (
    <div className="animate-fadeIn">
      <CampaignCalendar client={client} onRefresh={onRefresh} />
      <EmailListManager client={client} onRefresh={onRefresh} />
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background:'none', border:'1px solid #1e2a40', borderRadius:3,
  color:'#8a99b8', fontSize:11, padding:'5px 10px', cursor:'pointer',
}

function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:4, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}
