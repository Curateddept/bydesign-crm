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

const PLATFORMS = ['Instagram','TikTok','Facebook','Twitter/X','YouTube','LinkedIn','Email']
const TYPES     = ['Post','Reel','Story','Carousel','Video','Thread','Email']
const STATUS_OPTS = ['idea','writing','designed','approved','scheduled','posted']

const PLAT_COLOR: Record<string,string> = {
  Instagram:'#e1306c', TikTok:'#aaa', Facebook:'#1877f2',
  'Twitter/X':'#1d9bf0', YouTube:'#ff0000', LinkedIn:'#0a66c2', Email:'#00e87a',
}
const STATUS_COLOR: Record<string,string> = {
  idea:'#555', writing:'#ffb800', designed:'#a855f7',
  approved:'#00ff88', scheduled:'#3b82f6', posted:'#00ff88',
}

const blankForm = {
  title:'', caption:'', platform:'Instagram', type:'Reel',
  scheduledAt:'', postTime:'09:00', status:'idea',
  hashtags:'', strategy:'', notes:'',
}

// ─── Post form ────────────────────────────────────────────────────────────────

function PostForm({ form, set, onSave, onCancel, editing, uploading, uploadedFile, onFile, fileRef }:any) {
  return (
    <div className="hud-card" style={{ padding:22, marginBottom:20, borderColor:'rgba(255,255,255,0.2)' }}>
      <div className="label" style={{ marginBottom:14 }}>{editing ? 'Edit Post' : 'New Post'}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <F label="Post Title *">
          <input value={form.title} onChange={e=>set('title',e.target.value)}
            placeholder="e.g. Monday Morning Motivation Reel" className="input" autoFocus />
        </F>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr', gap:10 }}>
          <F label="Date">
            <input value={form.scheduledAt} onChange={e=>set('scheduledAt',e.target.value)}
              type="date" className="input" />
          </F>
          <F label="Time">
            <input value={form.postTime} onChange={e=>set('postTime',e.target.value)}
              type="time" className="input" />
          </F>
          <F label="Platform">
            <select value={form.platform} onChange={e=>set('platform',e.target.value)} className="input">
              {PLATFORMS.map(p=><option key={p}>{p}</option>)}
            </select>
          </F>
          <F label="Type">
            <select value={form.type} onChange={e=>set('type',e.target.value)} className="input">
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </F>
          <F label="Status">
            <select value={form.status} onChange={e=>set('status',e.target.value)} className="input">
              {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
            </select>
          </F>
        </div>
        <F label="Caption">
          <textarea value={form.caption} onChange={e=>set('caption',e.target.value)}
            placeholder="Write the post caption here..." rows={4} className="input" style={{ resize:'vertical' }} />
        </F>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <F label="Hashtags">
            <input value={form.hashtags} onChange={e=>set('hashtags',e.target.value)}
              placeholder="#hashtag1 #hashtag2" className="input" />
          </F>
          <F label="Attachment (Photo / Video)">
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button type="button" onClick={()=>fileRef.current?.click()} className="btn btn-ghost btn-sm" style={{ flexShrink:0 }}>
                {uploading ? 'Uploading…' : '📎 Upload File'}
              </button>
              {uploadedFile && <span style={{ fontSize:11, color:'#00ff88', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>✓ {uploadedFile.name}</span>}
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={onFile} style={{ display:'none' }} />
            </div>
          </F>
        </div>
        <F label="Strategy Notes">
          <textarea value={form.strategy} onChange={e=>set('strategy',e.target.value)}
            placeholder="Strategy, goal, target audience, talking points..." rows={2} className="input" style={{ resize:'vertical' }} />
        </F>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onSave} className="btn btn-primary btn-sm">SAVE POST</button>
          <button onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentTab({ client, onRefresh }:{ client:any; onRefresh:()=>void }) {
  const [adding,       setAdding]       = useState(false)
  const [editing,      setEditing]      = useState<string|null>(null)
  const [form,         setForm]         = useState({...blankForm})
  const [weekStart,    setWeekStart]    = useState(() => toISO(getMonday()))
  const [selected,     setSelected]     = useState<any>(null)
  const [uploading,    setUploading]    = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{url:string;name:string;type:string}|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const items: any[] = client.contentItems || []
  const dates = Array.from({ length:7 }, (_,i) => toISO(addDays(new Date(weekStart+'T12:00:00'), i)))

  const byDate: Record<string,any[]> = {}
  for (const d of dates) byDate[d] = []
  for (const item of items) {
    const d = item.scheduledAt?.split('T')[0]
    if (d && d in byDate) byDate[d].push(item)
  }
  // Sort each day by postTime
  for (const d of dates) byDate[d].sort((a,b)=>(a.postTime||'').localeCompare(b.postTime||''))

  const shiftWeek = (dir: 1|-1) => {
    const d = new Date(weekStart+'T12:00:00')
    d.setDate(d.getDate() + dir*7)
    setWeekStart(toISO(d))
    setSelected(null)
  }

  const save = async () => {
    if (!form.title.trim()) return alert('Title required')
    const payload: any = {
      ...form,
      clientId: client.id,
      // Combine date + time into scheduledAt ISO string
      scheduledAt: form.scheduledAt
        ? `${form.scheduledAt}T${form.postTime||'09:00'}:00.000Z`
        : null,
    }
    if (uploadedFile) { payload.fileUrl=uploadedFile.url; payload.fileName=uploadedFile.name; payload.fileType=uploadedFile.type }
    if (editing) {
      await fetch(`/api/content/${editing}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setEditing(null)
    } else {
      await fetch('/api/content', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setAdding(false)
    }
    setForm({...blankForm}); setUploadedFile(null); setSelected(null); onRefresh()
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

  const startEdit = (item: any) => {
    const dateStr = item.scheduledAt?.split('T')[0] || ''
    setForm({
      title:       item.title,
      caption:     item.caption||'',
      platform:    item.platform||'Instagram',
      type:        item.type||'Reel',
      scheduledAt: dateStr,
      postTime:    item.postTime||'09:00',
      status:      item.status||'idea',
      hashtags:    item.hashtags||'',
      strategy:    item.strategy||'',
      notes:       item.notes||'',
    })
    if (item.fileUrl) setUploadedFile({ url:item.fileUrl, name:item.fileName||'attachment', type:item.fileType||'' })
    setEditing(item.id); setAdding(false); setSelected(null)
    // Scroll to the week containing this post
    if (dateStr) setWeekStart(toISO(getMonday(new Date(dateStr+'T12:00:00'))))
  }

  const del = async (id:string) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/content/${id}`, { method:'DELETE' })
    setSelected(null); onRefresh()
  }

  const updateStatus = async (id:string, status:string) => {
    await fetch(`/api/content/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) })
    onRefresh()
  }

  const unscheduled = items.filter(i => !i.scheduledAt)

  return (
    <div className="animate-fadeIn">

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Social Calendar</span>
          <span style={{ fontSize:11, color:'#3d4f6e' }}>{items.length} post{items.length!==1?'s':''} total</span>
        </div>
        <button
          onClick={()=>{ setAdding(true); setEditing(null); setForm({...blankForm}); setUploadedFile(null); setSelected(null) }}
          className="btn btn-primary btn-sm">
          + ADD POST
        </button>
      </div>

      {/* Add / Edit Form */}
      {(adding || editing) && (
        <PostForm
          form={form} set={set}
          onSave={save}
          onCancel={()=>{ setAdding(false); setEditing(null); setUploadedFile(null) }}
          editing={editing}
          uploading={uploading}
          uploadedFile={uploadedFile}
          onFile={handleFile}
          fileRef={fileRef}
        />
      )}

      {/* Week navigation */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <button onClick={()=>shiftWeek(-1)} style={navBtn}>‹ Prev</button>
        <span style={{ fontSize:13, fontWeight:600, color:'#8a99b8' }}>
          {fmtShort(dates[0])} – {fmtShort(dates[6])}
        </span>
        <button onClick={()=>shiftWeek(1)} style={navBtn}>Next ›</button>
        <button onClick={()=>{ setWeekStart(toISO(getMonday())); setSelected(null) }} style={{ ...navBtn, fontSize:10, color:'#3d4f6e' }}>
          This Week
        </button>
        <span style={{ fontSize:11, color:'#2a3a55', marginLeft:'auto' }}>
          {dates.reduce((acc,d)=>acc+(byDate[d]?.length||0),0)} posts this week
        </span>
      </div>

      {/* 7-day calendar grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:20 }}>
        {dates.map(dateStr => {
          const d = new Date(dateStr+'T12:00:00')
          const posts = byDate[dateStr] || []
          const isToday = toISO(new Date()) === dateStr
          return (
            <div key={dateStr}>
              {/* Day header */}
              <div style={{
                padding:'8px 10px',
                background: isToday ? '#111827' : '#0d1424',
                border:`1px solid ${isToday ? '#2a3a55' : '#1e2a40'}`,
                borderBottom:`2px solid ${posts.length>0 ? '#2a3a55' : '#1e2a40'}`,
                borderRadius:'4px 4px 0 0',
              }}>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:isToday?'#e8eeff':'#2a3a55' }}>
                  {d.toLocaleDateString('en-US',{weekday:'short'})}
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:isToday?'#fff':'#8a99b8', marginTop:1 }}>
                  {d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                </div>
                {isToday && <div style={{ fontSize:8, color:'#00ff88', fontWeight:700, marginTop:2, letterSpacing:'0.1em' }}>TODAY</div>}
                {posts.length>0 && <div style={{ fontSize:9, color:'#2a3a55', marginTop:2 }}>{posts.length} post{posts.length!==1?'s':''}</div>}
              </div>
              {/* Posts column */}
              <div style={{
                background:'#0a0e1a', border:'1px solid #1e2a40', borderTop:'none',
                borderRadius:'0 0 4px 4px', minHeight:160, padding:6,
                display:'flex', flexDirection:'column', gap:5,
              }}>
                {posts.map((item:any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelected(selected?.id===item.id ? null : item)}
                    style={{
                      padding:'7px 9px', borderRadius:3, cursor:'pointer',
                      background: selected?.id===item.id ? '#161d2e' : '#111827',
                      border:`1px solid ${selected?.id===item.id ? '#e8eeff' : '#1e2a40'}`,
                      borderLeft:`3px solid ${STATUS_COLOR[item.status]||'#333'}`,
                      transition:'all 0.15s',
                    }}
                  >
                    {item.postTime && <div style={{ fontSize:8, color:'#3d4f6e', fontWeight:700, marginBottom:2 }}>{item.postTime}</div>}
                    {item.type && <div style={{ fontSize:8, color:'#3d4f6e', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2 }}>{item.type}</div>}
                    <div style={{ fontSize:11, fontWeight:700, color:'#e8eeff', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:3 }}>
                      {item.platform && <span style={{ fontSize:8, color:PLAT_COLOR[item.platform]||'#555', fontWeight:600 }}>{item.platform}</span>}
                      <span style={{ fontSize:8, color:STATUS_COLOR[item.status]||'#555', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{item.status}</span>
                    </div>
                    {item.fileUrl && <div style={{ marginTop:3, fontSize:8, color:'#8a99b8' }}>📎</div>}
                  </div>
                ))}
                {posts.length===0 && (
                  <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#1a2235', fontSize:18 }}>—</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected post detail panel */}
      {selected && (
        <div style={{ padding:20, background:'#111827', border:'1px solid #1e2a40', borderRadius:6, marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                {selected.type && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#3d4f6e' }}>{selected.type}</span>}
                {selected.platform && <span style={{ fontSize:11, color:PLAT_COLOR[selected.platform]||'#555', fontWeight:700 }}>{selected.platform}</span>}
                {/* Inline status change */}
                <select value={selected.status} onChange={e=>{updateStatus(selected.id,e.target.value); setSelected((s:any)=>({...s,status:e.target.value}))}}
                  style={{ fontSize:10, fontWeight:700, background:'rgba(255,255,255,0.05)', border:'1px solid #1e2a40', borderRadius:3, color:STATUS_COLOR[selected.status]||'#fff', padding:'2px 8px', cursor:'pointer', outline:'none', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ fontSize:16, fontWeight:800, color:'#f0f4ff', marginBottom:4 }}>{selected.title}</div>
              {selected.scheduledAt && (
                <div style={{ fontSize:11, color:'#3d4f6e' }}>
                  {fmtShort(selected.scheduledAt.split('T')[0])} {selected.postTime ? `at ${selected.postTime}` : ''}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {selected.fileUrl && (
                <a href={selected.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#8a99b8', textDecoration:'none', padding:'6px 12px', border:'1px solid #1e2a40', borderRadius:3 }}>
                  📎 {selected.fileName||'Attachment'} ↗
                </a>
              )}
              <button onClick={()=>startEdit(selected)} style={navBtn}>Edit</button>
              <button onClick={()=>del(selected.id)} style={{ ...navBtn, color:'#ff4466', borderColor:'rgba(255,68,102,0.3)' }}>Delete</button>
              <button onClick={()=>setSelected(null)} style={navBtn}>Close</button>
            </div>
          </div>
          {selected.caption && (
            <div style={{ fontSize:13, color:'#8a99b8', lineHeight:1.8, whiteSpace:'pre-wrap', marginBottom:selected.hashtags||selected.strategy?12:0 }}>
              {selected.caption}
            </div>
          )}
          {selected.hashtags && <div style={{ fontSize:12, color:'#7c3aed', marginBottom:selected.strategy?10:0 }}>{selected.hashtags}</div>}
          {selected.strategy && (
            <div style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid #1e2a40', borderRadius:4 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#3d4f6e', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Strategy</div>
              <div style={{ fontSize:12, color:'#555', lineHeight:1.7 }}>{selected.strategy}</div>
            </div>
          )}
        </div>
      )}

      {/* Unscheduled posts (no scheduledAt date) */}
      {unscheduled.length > 0 && (
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'#2a3a55', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>
            Unscheduled ({unscheduled.length})
          </div>
          <div className="hud-card" style={{ overflow:'hidden' }}>
            {unscheduled.map((item:any, i:number) => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 18px', borderBottom:i<unscheduled.length-1?'1px solid #111':'none' }}>
                <div style={{ width:3, height:28, borderRadius:2, background:STATUS_COLOR[item.status]||'#333', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{item.title}</div>
                  <div style={{ fontSize:11, color:'#444' }}>{[item.platform, item.type].filter(Boolean).join(' · ')}</div>
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

const navBtn: React.CSSProperties = {
  background:'none', border:'1px solid #1e2a40', borderRadius:3,
  color:'#8a99b8', fontSize:11, padding:'6px 12px', cursor:'pointer',
}

function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}
