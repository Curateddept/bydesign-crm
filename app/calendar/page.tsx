'use client'
import { useEffect, useState } from 'react'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getMonday(date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r
}
function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}
function fmtShort(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
}
function fmtLong(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
}

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const TYPES     = ['Photo','Video','Reel','Story','Carousel','Thread','Short']
const PLATFORMS = ['Instagram','TikTok','Facebook','Twitter/X','YouTube','LinkedIn']
const PLAT_COLOR: Record<string,string> = {
  Instagram:'#e1306c', TikTok:'#8a99b8', Facebook:'#1877f2',
  'Twitter/X':'#1d9bf0', YouTube:'#ff0000', LinkedIn:'#0a66c2',
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ item, onEdit, onDelete }: { item:any; onEdit:()=>void; onDelete:()=>void }) {
  return (
    <div
      onClick={onEdit}
      style={{
        background:'#161d2e', border:'1px solid #1e2a40', borderRadius:5,
        padding:'9px 11px', cursor:'pointer', position:'relative',
        transition:'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor='#2a3a55'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)' }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='#1e2a40'; e.currentTarget.style.boxShadow='none' }}
    >
      {/* Platform dot */}
      {item.platform && (
        <div style={{ position:'absolute', top:8, right:8, width:6, height:6, borderRadius:'50%', background:PLAT_COLOR[item.platform]||'#555' }} />
      )}
      {/* Type badge */}
      {item.type && (
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#3d4f6e', marginBottom:3 }}>{item.type}</div>
      )}
      {/* Title */}
      <div style={{ fontSize:12, fontWeight:700, color:'#e8eeff', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', paddingRight:10 }}>
        {item.title}
      </div>
      {/* Caption preview */}
      {item.caption && (
        <div style={{ fontSize:11, color:'#3d4f6e', lineHeight:1.5, marginTop:4, display:'-webkit-box', overflow:'hidden', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as any}>
          {item.caption}
        </div>
      )}
      {/* Delete */}
      <button
        onClick={e=>{ e.stopPropagation(); onDelete() }}
        style={{ position:'absolute', bottom:5, right:5, background:'none', border:'none', color:'#1e2a40', fontSize:11, cursor:'pointer', padding:2, transition:'color 0.12s' }}
        onMouseEnter={e=>(e.currentTarget.style.color='#e44332')}
        onMouseLeave={e=>(e.currentTarget.style.color='#1e2a40')}
      >✕</button>
    </div>
  )
}

// ─── Day column ───────────────────────────────────────────────────────────────

function DayCol({ dateStr, posts, onAdd, onEdit, onDelete }: {
  dateStr:string; posts:any[]
  onAdd:(d:string)=>void; onEdit:(item:any)=>void; onDelete:(id:string)=>void
}) {
  const d = new Date(dateStr + 'T12:00:00')
  const today = toISO(new Date()) === dateStr
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{
        padding:'8px 10px 10px', borderBottom:`2px solid ${posts.length>0?'#2a3a55':'#1a2235'}`,
        marginBottom:8,
      }}>
        <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color: today?'#e8eeff':'#3d4f6e' }}>
          {d.toLocaleDateString('en-US',{weekday:'short'})}
        </div>
        <div style={{ fontSize:13, fontWeight:700, color: today?'#fff':'#8a99b8', marginTop:1 }}>
          {d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
        </div>
        {today && <div style={{ fontSize:8, color:'#00e87a', fontWeight:700, letterSpacing:'0.1em', marginTop:2 }}>TODAY</div>}
        {posts.length>0 && <div style={{ fontSize:9, color:'#2a3a55', marginTop:3 }}>{posts.length} post{posts.length!==1?'s':''}</div>}
      </div>
      {/* Posts */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:5 }}>
        {posts.map(item=>(
          <PostCard key={item.id} item={item} onEdit={()=>onEdit(item)} onDelete={()=>onDelete(item.id)} />
        ))}
      </div>
      {/* Add */}
      <button
        onClick={()=>onAdd(dateStr)}
        style={{
          marginTop:8, padding:'7px', background:'none', border:'1px dashed #1a2235',
          borderRadius:4, color:'#2a3a55', fontSize:12, cursor:'pointer', transition:'all 0.15s',
        }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor='#2a3a55'; e.currentTarget.style.color='#8a99b8' }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor='#1a2235'; e.currentTarget.style.color='#2a3a55' }}
      >+</button>
    </div>
  )
}

// ─── Add / Edit modal ─────────────────────────────────────────────────────────

const BLANK = { title:'', caption:'', type:'', platform:'Instagram', notes:'' }

function PostModal({ date, item, onSave, onClose }: {
  date:string; item:any|null; onSave:(d:any)=>Promise<void>; onClose:()=>void
}) {
  const [form, setForm] = useState(item ? {
    title: item.title||'', caption: item.caption||'',
    type: item.type||'', platform: item.platform||'Instagram', notes: item.notes||'',
  } : { ...BLANK })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.title.trim()) return
    setSaving(true); await onSave(form); setSaving(false)
  }

  const dateLabel = new Date(date+'T12:00:00').toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' })

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose() }}>
      <div style={{ background:'#111827', border:'1px solid #1e2a40', borderRadius:8, width:'min(540px,95vw)', padding:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#f0f4ff' }}>{item?'Edit Post':'New Post'}</h2>
            <p style={{ fontSize:11, color:'#3d4f6e', marginTop:3 }}>{dateLabel}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#3d4f6e', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <div className="label" style={{ marginBottom:6 }}>Post Title *</div>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
              className="input" placeholder="What's this post about?" autoFocus
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey) submit() }} />
          </div>

          <div>
            <div className="label" style={{ marginBottom:6 }}>
              Caption &nbsp;<span style={{ color:'#2a3a55', fontWeight:400, textTransform:'none', letterSpacing:0 }}>optional</span>
            </div>
            <textarea value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})}
              rows={5} className="input" placeholder="Write the caption for this post..."
              style={{ resize:'vertical', lineHeight:1.7 }} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <div className="label" style={{ marginBottom:6 }}>Content Type &nbsp;<span style={{ color:'#2a3a55', fontWeight:400, textTransform:'none', letterSpacing:0 }}>optional</span></div>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="input">
                <option value="">No type</option>
                {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="label" style={{ marginBottom:6 }}>Platform</div>
              <select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})} className="input">
                {PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom:6 }}>Notes &nbsp;<span style={{ color:'#2a3a55', fontWeight:400, textTransform:'none', letterSpacing:0 }}>optional</span></div>
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
              rows={2} className="input" placeholder="Strategy notes, reminders..."
              style={{ resize:'vertical' }} />
          </div>
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:22 }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={submit} disabled={saving||!form.title.trim()} className="btn btn-primary"
            style={{ opacity:form.title.trim()?1:0.4 }}>
            {saving?'Saving...':item?'Save Changes':'Add Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PDF export ───────────────────────────────────────────────────────────────

function exportPDF(clientName:string, dates:string[], byDate:Record<string,any[]>, notes:string, period:number) {
  const weeks: string[][] = []
  for (let i=0; i<dates.length; i+=7) weeks.push(dates.slice(i,i+7))

  const postCard = (p:any) => `
    <div class="post">
      ${p.type?`<div class="post-type">${p.type} ${p.platform?`· ${p.platform}`:''}</div>`:''}
      <div class="post-title">${p.title}</div>
      ${p.caption?`<div class="post-caption">${p.caption.replace(/\n/g,'<br>')}</div>`:''}
    </div>`

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${clientName} — Content Calendar</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;color:#111;padding:36px;font-size:13px}
.header{margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #111}
.brand{font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#999;margin-bottom:6px}
.client{font-size:24px;font-weight:800;letter-spacing:-.02em}
.range{font-size:12px;color:#666;margin-top:4px}
.week{margin-bottom:24px}
.week-label{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#bbb;margin-bottom:8px}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.day{border:1px solid #e5e5e5;border-radius:4px;overflow:hidden}
.day-head{background:#f7f7f7;padding:8px 10px;border-bottom:1px solid #e5e5e5}
.day-name{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#999}
.day-date{font-size:12px;font-weight:700;color:#111;margin-top:1px}
.posts{padding:6px;display:flex;flex-direction:column;gap:5px;min-height:90px}
.post{border:1px solid #eee;border-radius:3px;padding:6px 8px}
.post-type{font-size:8px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#bbb;margin-bottom:2px}
.post-title{font-size:11px;font-weight:700;color:#111;line-height:1.4;margin-bottom:3px}
.post-caption{font-size:10px;color:#555;line-height:1.5}
.empty{color:#ddd;font-size:10px;text-align:center;padding:20px 0}
.notes-wrap{margin-top:24px;padding-top:18px;border-top:1px solid #e5e5e5}
.notes-label{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#999;margin-bottom:10px}
.notes-body{font-size:12px;color:#333;line-height:1.8;white-space:pre-wrap}
.footer{margin-top:36px;font-size:9px;color:#ccc;text-align:right}
@page{margin:20mm}
</style></head><body>
<div class="header">
  <div class="brand">ByDesign CRM · Content Calendar</div>
  <div class="client">${clientName}</div>
  <div class="range">${period}-Day Plan &nbsp;·&nbsp; ${fmtLong(dates[0])} – ${fmtLong(dates[dates.length-1])}</div>
</div>
${weeks.map((week,wi)=>`
<div class="week">
  ${weeks.length>1?`<div class="week-label">Week ${wi+1} &nbsp;·&nbsp; ${fmtShort(week[0])} – ${fmtShort(week[week.length-1])}</div>`:''}
  <div class="grid">
    ${week.map(d=>{
      const dt = new Date(d+'T12:00:00')
      const ps = byDate[d]||[]
      return `<div class="day">
        <div class="day-head">
          <div class="day-name">${dt.toLocaleDateString('en-US',{weekday:'short'})}</div>
          <div class="day-date">${dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
        </div>
        <div class="posts">${ps.length?ps.map(postCard).join(''):'<div class="empty">—</div>'}</div>
      </div>`
    }).join('')}
  </div>
</div>`).join('')}
${notes.trim()?`<div class="notes-wrap"><div class="notes-label">Strategy Notes</div><div class="notes-body">${notes}</div></div>`:''}
<div class="footer">Generated by ByDesign CRM &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</div>
</body></html>`

  const w = window.open('','_blank')
  if(w){ w.document.write(html); w.document.close(); setTimeout(()=>w.print(),600) }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [clients,   setClients]   = useState<any[]>([])
  const [clientId,  setClientId]  = useState('')
  const [content,   setContent]   = useState<any[]>([])
  const [loading,   setLoading]   = useState(false)
  const [period,    setPeriod]    = useState<7|14|21>(7)
  const [weekStart, setWeekStart] = useState(() => toISO(getMonday()))
  const [notes,     setNotes]     = useState('')
  const [modal,     setModal]     = useState<{date:string;item:any|null}|null>(null)

  // Notes → localStorage keyed per client+week
  useEffect(() => {
    if (!clientId) return
    setNotes(localStorage.getItem(`cal_notes_${clientId}_${weekStart}`) || '')
  }, [clientId, weekStart])

  const saveNotes = (v:string) => {
    setNotes(v)
    if (clientId) localStorage.setItem(`cal_notes_${clientId}_${weekStart}`, v)
  }

  // Load clients
  useEffect(() => {
    fetch('/api/clients').then(r=>r.json()).then(c=>{
      const active = (Array.isArray(c)?c:[]).filter((x:any)=>x.status==='active')
      setClients(active)
      if (active.length) setClientId(active[0].id)
    })
  }, [])

  // Load content per client
  useEffect(() => {
    if (!clientId) return
    setLoading(true)
    fetch(`/api/content?clientId=${clientId}`).then(r=>r.json()).then(d=>{
      setContent(Array.isArray(d)?d:[])
      setLoading(false)
    })
  }, [clientId])

  // Build date array
  const dates: string[] = Array.from({length:period},(_,i)=>
    toISO(addDays(new Date(weekStart+'T12:00:00'),i))
  )

  // Group by scheduledAt date
  const byDate: Record<string,any[]> = {}
  for (const d of dates) byDate[d]=[]
  for (const item of content) {
    const d = item.scheduledAt?.split('T')[0] || item.scheduledAt
    if (d && d in byDate) byDate[d].push(item)
  }

  const totalPosts = Object.values(byDate).flat().length
  const selectedClient = clients.find(c=>c.id===clientId)

  const weeks: string[][] = []
  for (let i=0;i<dates.length;i+=7) weeks.push(dates.slice(i,i+7))

  const savePost = async (formData:any) => {
    if (!modal) return
    const body = {
      ...formData,
      clientId,
      scheduledAt: modal.date,
      dayOfWeek: DAY_NAMES[new Date(modal.date+'T12:00:00').getDay()],
      status: modal.item?.status || 'idea',
    }
    if (modal.item) {
      await fetch(`/api/content/${modal.item.id}`,{
        method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
      })
    } else {
      await fetch('/api/content',{
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
      })
    }
    setModal(null)
    fetch(`/api/content?clientId=${clientId}`).then(r=>r.json()).then(d=>setContent(Array.isArray(d)?d:[]))
  }

  const deletePost = async (id:string) => {
    await fetch(`/api/content/${id}`,{method:'DELETE'})
    setContent(prev=>prev.filter(i=>i.id!==id))
  }

  const shiftWeek = (dir:1|-1) => {
    const d = new Date(weekStart+'T12:00:00')
    d.setDate(d.getDate()+dir*period)
    setWeekStart(toISO(d))
  }

  return (
    <div className="animate-fadeIn">

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
        <div>
          <div className="label" style={{ marginBottom:6 }}>Social Media</div>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.02em' }}>Content Scheduler</h1>
          {selectedClient && (
            <p style={{ color:'#3d4f6e', fontSize:12, marginTop:4 }}>
              {selectedClient.name} &nbsp;·&nbsp; {totalPosts} post{totalPosts!==1?'s':''} planned this period
            </p>
          )}
        </div>
        {selectedClient && (
          <button
            onClick={()=>exportPDF(selectedClient.name, dates, byDate, notes, period)}
            className="btn btn-ghost" style={{ marginTop:4, fontSize:11 }}>
            ↓ Export PDF
          </button>
        )}
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:28, flexWrap:'wrap' }}>

        {/* Client picker */}
        <select value={clientId} onChange={e=>setClientId(e.target.value)}
          className="input" style={{ maxWidth:200, fontWeight:700 }}>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Date nav */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={()=>shiftWeek(-1)} className="btn btn-ghost btn-sm">‹ Prev</button>
          <input type="date" value={weekStart} onChange={e=>setWeekStart(e.target.value)}
            className="input" style={{ width:150 }} />
          <button onClick={()=>shiftWeek(1)} className="btn btn-ghost btn-sm">Next ›</button>
        </div>

        {/* Period toggle */}
        <div style={{ display:'flex', border:'1px solid #1e2a40', borderRadius:4, overflow:'hidden' }}>
          {([7,14,21] as const).map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{
              padding:'7px 16px', fontSize:11, fontWeight:700, border:'none', cursor:'pointer',
              background: period===p ? '#e8eeff' : 'transparent',
              color: period===p ? '#0b0f1a' : '#3d4f6e',
              letterSpacing:'0.04em', transition:'all 0.12s',
            }}>{p} days</button>
          ))}
        </div>

        {/* Jump to today */}
        <button onClick={()=>setWeekStart(toISO(getMonday()))}
          className="btn btn-ghost btn-sm" style={{ fontSize:10, letterSpacing:'0.05em' }}>
          Today
        </button>
      </div>

      {/* Calendar */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#3d4f6e' }}>Loading...</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
          {weeks.map((week,wi)=>(
            <div key={wi}>
              {weeks.length>1 && (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div className="label" style={{ color:'#2a3a55' }}>Week {wi+1}</div>
                  <div style={{ fontSize:11, color:'#1e2a40' }}>{fmtShort(week[0])} – {fmtShort(week[week.length-1])}</div>
                </div>
              )}
              <div style={{
                display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10,
                background:'#0f1528', border:'1px solid #1e2a40', borderRadius:6, padding:12,
              }}>
                {week.map(dateStr=>(
                  <DayCol
                    key={dateStr}
                    dateStr={dateStr}
                    posts={byDate[dateStr]||[]}
                    onAdd={d=>setModal({date:d,item:null})}
                    onEdit={item=>setModal({date:item.scheduledAt?.split('T')[0]||dateStr,item})}
                    onDelete={deletePost}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strategy notes */}
      <div style={{ marginTop:28, background:'#0f1528', border:'1px solid #1e2a40', borderRadius:6, padding:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div className="label">Strategy Notes for This Period</div>
          {notes && <span style={{ fontSize:10, color:'#2a3a55' }}>Auto-saved</span>}
        </div>
        <textarea
          value={notes}
          onChange={e=>saveNotes(e.target.value)}
          rows={4}
          placeholder="Goals, key themes, hashtag strategy, hooks, notes for this content period... (auto-saved per client)"
          style={{
            width:'100%', background:'transparent', border:'none', outline:'none',
            color:'#8a99b8', fontSize:13, lineHeight:1.8, resize:'vertical', fontFamily:'inherit',
          }}
        />
      </div>

      {/* Add/Edit modal */}
      {modal && (
        <PostModal
          date={modal.date}
          item={modal.item}
          onSave={savePost}
          onClose={()=>setModal(null)}
        />
      )}

    </div>
  )
}
