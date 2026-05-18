'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

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
function fmtDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month:'short', day:'numeric' })
}
function timeAgo(s: string) {
  const diff = Date.now() - new Date(s).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const PLAT_COLOR: Record<string,string> = {
  Instagram:'#e1306c', TikTok:'#aaa', Facebook:'#1877f2',
  'Twitter/X':'#1d9bf0', YouTube:'#ff0000', LinkedIn:'#0a66c2',
}

const TASK_STATUS: Record<string, { label:string; color:string; bg:string }> = {
  pending:     { label:'Pending',        color:'#8a99b8', bg:'rgba(138,153,184,0.1)'  },
  in_progress: { label:'In Progress',   color:'#fdab3d', bg:'rgba(253,171,61,0.12)'  },
  done:        { label:'Done',           color:'#00e87a', bg:'rgba(0,232,122,0.1)'   },
  approved:    { label:'Approved',       color:'#00e87a', bg:'rgba(0,232,122,0.1)'   },
  stuck:       { label:'Needs Attention',color:'#ff4466', bg:'rgba(255,68,102,0.1)'  },
}

// ─── Components ───────────────────────────────────────────────────────────────

function TabBar({ tab, setTab }: { tab:string; setTab:(t:any)=>void }) {
  const tabs = [
    { id:'social',  label:'Social Schedule' },
    { id:'email',   label:'Email Schedule'  },
    { id:'tasks',   label:'To Do List'      },
    { id:'ideas',   label:'Add Something'   },
  ]
  return (
    <div style={{ display:'flex', borderBottom:'1px solid #1e2a40', marginBottom:28 }}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{
          padding:'11px 20px', fontSize:11, fontWeight:700, letterSpacing:'0.08em',
          textTransform:'uppercase', background:'none', border:'none', cursor:'pointer',
          color: tab===t.id ? '#f0f4ff' : '#3d4f6e',
          borderBottom:`2px solid ${tab===t.id ? '#e8eeff' : 'transparent'}`,
          marginBottom:-1, transition:'all 0.15s',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

// ─── Shared Calendar View ─────────────────────────────────────────────────────

function CalendarTab({ client, filterFn, emptyMsg }: { client:any; filterFn:(item:any)=>boolean; emptyMsg:string }) {
  const [weekStart, setWeekStart] = useState(() => toISO(getMonday()))
  const [selected,  setSelected]  = useState<any>(null)
  const [note,      setNote]      = useState('')
  const [noteSent,  setNoteSent]  = useState(false)

  const dates = Array.from({length:7}, (_,i) => toISO(addDays(new Date(weekStart+'T12:00:00'), i)))
  const allContent: any[] = (client.contentItems || []).filter(filterFn)

  const byDate: Record<string,any[]> = {}
  for (const d of dates) byDate[d] = []
  for (const item of allContent) {
    const d = item.scheduledAt?.split('T')[0]
    if (d && d in byDate) byDate[d].push(item)
  }

  const shiftWeek = (dir:1|-1) => {
    const d = new Date(weekStart+'T12:00:00')
    d.setDate(d.getDate() + dir*7)
    setWeekStart(toISO(d))
    setSelected(null)
  }

  const sendFeedback = async () => {
    if (!note.trim()) return
    await fetch('/api/notes', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ clientId:client.id, content:`[CLIENT FEEDBACK] ${note}`, type:'note', priority:'high' }),
    })
    setNoteSent(true); setNote('')
    setTimeout(()=>setNoteSent(false), 3000)
  }

  return (
    <>
      {/* Week nav */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <button onClick={()=>shiftWeek(-1)} style={navBtn}>‹ Prev</button>
        <span style={{ fontSize:13, fontWeight:600, color:'#8a99b8' }}>
          {fmtShort(dates[0])} – {fmtShort(dates[6])}
        </span>
        <button onClick={()=>shiftWeek(1)} style={navBtn}>Next ›</button>
        <button onClick={()=>{ setWeekStart(toISO(getMonday())); setSelected(null) }} style={{ ...navBtn, fontSize:10, color:'#3d4f6e' }}>
          This Week
        </button>
      </div>

      {/* 7-day grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:20 }}>
        {dates.map(dateStr=>{
          const d = new Date(dateStr+'T12:00:00')
          const posts = byDate[dateStr]||[]
          const isToday = toISO(new Date())===dateStr
          return (
            <div key={dateStr}>
              <div style={{
                padding:'8px 10px', background:'#111827', border:'1px solid #1e2a40',
                borderRadius:'4px 4px 0 0',
                borderBottom:`2px solid ${posts.length>0?'#2a3a55':'#1e2a40'}`,
              }}>
                <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:isToday?'#e8eeff':'#2a3a55' }}>
                  {d.toLocaleDateString('en-US',{weekday:'short'})}
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:isToday?'#fff':'#8a99b8', marginTop:1 }}>
                  {d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                </div>
                {isToday && <div style={{ fontSize:8, color:'#00e87a', fontWeight:700, marginTop:2, letterSpacing:'0.1em' }}>TODAY</div>}
                {posts.length>0 && <div style={{ fontSize:9, color:'#2a3a55', marginTop:2 }}>{posts.length} post{posts.length!==1?'s':''}</div>}
              </div>
              <div style={{
                background:'#0f1528', border:'1px solid #1e2a40', borderTop:'none',
                borderRadius:'0 0 4px 4px', minHeight:160, padding:6, display:'flex', flexDirection:'column', gap:5,
              }}>
                {posts.map((item:any)=>(
                  <div key={item.id} onClick={()=>setSelected(selected?.id===item.id?null:item)}
                    style={{
                      padding:'8px 10px', background:'#161d2e', borderRadius:3, cursor:'pointer',
                      border:`1px solid ${selected?.id===item.id?'#e8eeff':'#1e2a40'}`,
                      transition:'border-color 0.15s',
                    }}>
                    {item.type&&<div style={{ fontSize:9, color:'#3d4f6e', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:2 }}>{item.type}</div>}
                    <div style={{ fontSize:11, fontWeight:700, color:'#e8eeff', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                    {item.platform&&<div style={{ fontSize:9, color:PLAT_COLOR[item.platform]||'#555', marginTop:3, fontWeight:600 }}>{item.platform}</div>}
                  </div>
                ))}
                {posts.length===0&&<div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#1a2235', fontSize:18 }}>{emptyMsg||'—'}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      {selected&&(
        <div style={{ padding:20, background:'#111827', border:'1px solid #1e2a40', borderRadius:4, marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
                {selected.type&&<span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#3d4f6e' }}>{selected.type}</span>}
                {selected.platform&&<span style={{ fontSize:11, color:PLAT_COLOR[selected.platform]||'#555', fontWeight:600 }}>{selected.platform}</span>}
              </div>
              <div style={{ fontSize:15, fontWeight:800, color:'#f0f4ff', marginBottom:4 }}>{selected.title}</div>
              {selected.scheduledAt&&<div style={{ fontSize:11, color:'#3d4f6e' }}>{fmtShort(selected.scheduledAt.split('T')[0])}</div>}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {selected.fileUrl&&<a href={selected.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#8a99b8', textDecoration:'none', padding:'6px 12px', border:'1px solid #1e2a40', borderRadius:3 }}>📎 Download ↗</a>}
              <button onClick={()=>setSelected(null)} style={{ ...navBtn }}>Close</button>
            </div>
          </div>
          {selected.caption&&<div style={{ fontSize:13, color:'#8a99b8', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{selected.caption}</div>}
        </div>
      )}

      {/* Feedback */}
      <div style={{ padding:20, background:'#111827', border:'1px solid #1e2a40', borderRadius:4 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#2a3a55', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>
          Request a Change or Leave Feedback
        </div>
        {noteSent ? (
          <div style={{ fontSize:13, color:'#00e87a' }}>✓ Sent to your team!</div>
        ) : (
          <div style={{ display:'flex', gap:10 }}>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder="e.g. Can we update the Wednesday caption? Add a post Friday?"
              rows={2} style={textareaStyle} />
            <button onClick={sendFeedback} disabled={!note.trim()}
              style={{ padding:'0 20px', background:'#e8eeff', color:'#0b0f1a', border:'none', borderRadius:3, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0, opacity:note.trim()?1:0.4 }}>
              Send
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Social Schedule Tab ──────────────────────────────────────────────────────

const SOCIAL_PLATFORMS = ['Instagram','TikTok','Facebook','Twitter/X','YouTube','LinkedIn','Pinterest']

function SocialTab({ client }: { client:any }) {
  return (
    <CalendarTab
      client={client}
      filterFn={(item) => !item.platform || item.platform.toLowerCase() !== 'email'}
      emptyMsg="—"
    />
  )
}

// ─── Email Schedule Tab ───────────────────────────────────────────────────────

function EmailTab({ client }: { client:any }) {
  const emailItems = (client.contentItems||[]).filter((i:any) => i.platform?.toLowerCase() === 'email')
  if (emailItems.length === 0) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <div style={{ fontSize:32, marginBottom:12 }}>✉️</div>
      <div style={{ fontSize:13, color:'#3d4f6e', lineHeight:1.7 }}>
        No email campaigns scheduled yet.<br/>Your team will add them here as they are planned.
      </div>
    </div>
  )
  return (
    <CalendarTab
      client={client}
      filterFn={(item) => item.platform?.toLowerCase() === 'email'}
      emptyMsg="—"
    />
  )
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TasksTab({ client }: { client:any }) {
  const deliverables: any[] = client.deliverables || []

  const groups = [
    { key:'in_progress', label:'In Progress',    items: deliverables.filter(d=>d.status==='in_progress') },
    { key:'pending',     label:'Up Next',         items: deliverables.filter(d=>d.status==='pending')     },
    { key:'stuck',       label:'Needs Attention', items: deliverables.filter(d=>d.status==='stuck')       },
    { key:'done',        label:'Completed',       items: deliverables.filter(d=>d.status==='done'||d.status==='approved') },
  ].filter(g => g.items.length > 0)

  if (deliverables.length === 0) return (
    <div style={{ textAlign:'center', padding:'60px 0', color:'#2a3a55', fontSize:13 }}>
      No tasks assigned yet.
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {groups.map(g => {
        const sm = TASK_STATUS[g.key] || TASK_STATUS.pending
        return (
          <div key={g.key}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:sm.color }} />
              <span style={{ fontSize:11, fontWeight:700, color:sm.color, letterSpacing:'0.08em', textTransform:'uppercase' }}>{g.label}</span>
              <span style={{ fontSize:10, color:'#2a3a55' }}>{g.items.length}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {g.items.map((task:any)=>(
                <div key={task.id} style={{
                  display:'grid', gridTemplateColumns:'1fr auto auto',
                  alignItems:'center', gap:16,
                  padding:'12px 16px', background:'#111827',
                  border:'1px solid #1e2a40', borderRadius:4,
                  borderLeft:`3px solid ${sm.color}`,
                }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#e8eeff' }}>{task.title}</div>
                    {task.notes&&<div style={{ fontSize:11, color:'#3d4f6e', marginTop:3 }}>{task.notes}</div>}
                  </div>
                  {task.dueDate&&(
                    <div style={{ fontSize:11, color:'#3d4f6e', whiteSpace:'nowrap' }}>
                      Due {fmtDate(task.dueDate)}
                    </div>
                  )}
                  <div style={{
                    padding:'3px 10px', borderRadius:3, fontSize:10, fontWeight:700,
                    background: sm.bg, color: sm.color, letterSpacing:'0.05em', whiteSpace:'nowrap',
                  }}>{sm.label}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Ideas Tab ────────────────────────────────────────────────────────────────

function IdeasTab({ clientId }: { clientId:string }) {
  const [ideas,   setIdeas]   = useState<any[]>([])
  const [text,    setText]    = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  const load = () =>
    fetch(`/api/portal/ideas/${clientId}`)
      .then(r=>r.json())
      .then(d=>setIdeas(Array.isArray(d)?d:[]))

  useEffect(()=>{ load() }, [clientId])

  const submit = async () => {
    if (!text.trim()) return
    setSending(true)
    await fetch(`/api/portal/ideas/${clientId}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ content: text.trim() }),
    })
    setText(''); setSending(false); setSent(true)
    load()
    setTimeout(()=>setSent(false), 3000)
  }

  return (
    <div>
      {/* Submit form */}
      <div style={{ padding:20, background:'#111827', border:'1px solid #1e2a40', borderRadius:6, marginBottom:24 }}>
        <div style={{ fontSize:14, fontWeight:800, color:'#f0f4ff', marginBottom:4 }}>Submit an Idea or Request</div>
        <p style={{ fontSize:12, color:'#3d4f6e', marginBottom:14, lineHeight:1.6 }}>
          Have a content idea, want to try a new platform, or need something changed? Drop it here and your team will see it.
        </p>
        {sent ? (
          <div style={{ fontSize:13, color:'#00e87a', padding:'10px 0' }}>✓ Submitted! Your team will review it shortly.</div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder="e.g. Can we do a behind-the-scenes Reel this week? Or post more on Thursday evenings..."
              rows={3}
              style={{ ...textareaStyle, marginBottom:12, border:'1px solid #1e2a40', borderRadius:4, padding:'10px 14px' }}
            />
            <button onClick={submit} disabled={sending||!text.trim()} style={{
              padding:'9px 20px', background:'#e8eeff', color:'#0b0f1a',
              border:'none', borderRadius:4, fontSize:12, fontWeight:700,
              cursor:'pointer', opacity:text.trim()?1:0.4, transition:'opacity 0.15s',
            }}>{sending?'Sending...':'Submit Idea'}</button>
          </>
        )}
      </div>

      {/* Previous ideas */}
      {ideas.length > 0 && (
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'#2a3a55', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>
            Your Previous Submissions
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {ideas.map(idea=>(
              <div key={idea.id} style={{
                padding:'14px 16px', background:'#111827', border:'1px solid #1e2a40', borderRadius:4,
              }}>
                <div style={{ fontSize:13, color:'#e8eeff', lineHeight:1.7, marginBottom:6 }}>{idea.content}</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:10, color:'#2a3a55' }}>{timeAgo(idea.createdAt)}</span>
                  <span style={{
                    fontSize:9, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
                    color: idea.status==='done'?'#00e87a':'#3d4f6e',
                    padding:'2px 7px', background: idea.status==='done'?'rgba(0,232,122,0.08)':'transparent',
                    borderRadius:3, border:`1px solid ${idea.status==='done'?'rgba(0,232,122,0.2)':'#1e2a40'}`,
                  }}>
                    {idea.status==='done'?'Completed':'Received'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ideas.length === 0 && !sent && (
        <div style={{ textAlign:'center', padding:'30px 0', color:'#2a3a55', fontSize:13 }}>
          No ideas submitted yet — share your first one above.
        </div>
      )}
    </div>
  )
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ client }: { client:any }) {
  const analytics: any[] = client.analytics || []
  const latest = analytics[0]
  const chartData = [...analytics]
    .sort((a,b)=>a.periodStart.localeCompare(b.periodStart))
    .map(e=>({
      period: new Date(e.periodStart).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      followers: e.followers||0,
    }))

  if (!latest) return (
    <div style={{ textAlign:'center', padding:'60px 0', color:'#2a3a55', fontSize:13 }}>
      No analytics data available yet.
    </div>
  )

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
        {[
          ['Followers',  latest.followers,     '#e8eeff'],
          ['Growth',     latest.followersGrowth!=null?(latest.followersGrowth>=0?'+':'')+latest.followersGrowth:null, latest.followersGrowth>=0?'#00e87a':'#ff4466'],
          ['Reach',      latest.reach,          '#a25ddc'],
          ['Engagement', latest.engagementRate!=null?`${latest.engagementRate}%`:null, '#ffb800'],
        ].filter(([,v])=>v!=null).map(([l,v,c])=>(
          <div key={l as string} style={{ padding:'18px 20px', background:'#111827', border:'1px solid #1e2a40', borderRadius:4 }}>
            <div style={{ fontSize:9, fontWeight:700, color:'#2a3a55', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>{l}</div>
            <div style={{ fontSize:28, fontWeight:900, color:c as string }}>{typeof v==='number'?v.toLocaleString():v}</div>
          </div>
        ))}
      </div>
      {chartData.length>1&&(
        <div style={{ padding:'18px 20px', background:'#111827', border:'1px solid #1e2a40', borderRadius:4 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#2a3a55', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:14 }}>Follower Growth</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e8eeff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#e8eeff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="period" tick={{ fill:'#2a3a55', fontSize:9 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'#111827', border:'1px solid #1e2a40', fontSize:11, color:'#f0f4ff' }}/>
              <Area type="monotone" dataKey="followers" stroke="#e8eeff" strokeWidth={2} fill="url(#gP)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const navBtn: React.CSSProperties = {
  background:'none', border:'1px solid #1e2a40', borderRadius:3,
  color:'#8a99b8', fontSize:11, padding:'6px 12px', cursor:'pointer',
}

const textareaStyle: React.CSSProperties = {
  width:'100%', background:'#0f1528', border:'none', borderRadius:3,
  color:'#f0f4ff', fontSize:13, outline:'none', resize:'none',
  lineHeight:1.7, fontFamily:'inherit', padding:'10px 14px',
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientPortalPage() {
  const { id }  = useParams<{id:string}>()
  const router  = useRouter()
  const [client, setClient] = useState<any>(null)
  const [tab,    setTab]    = useState<'social'|'email'|'tasks'|'ideas'>('social')

  useEffect(()=>{
    const stored = sessionStorage.getItem('portalClient')
    if (!stored) { router.push('/portal'); return }
    const data = JSON.parse(stored)
    if (data.id !== id) { router.push('/portal'); return }
    setClient(data)
  }, [id])

  if (!client) return (
    <div style={{ minHeight:'100vh', background:'#0b0f1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#3d4f6e', fontSize:13 }}>Loading...</div>
    </div>
  )

  const taskCount = (client.deliverables||[]).filter((d:any)=>d.status!=='done'&&d.status!=='approved').length
  const newIdeasBadge = false // could track unread

  return (
    <div style={{ minHeight:'100vh', background:'#0b0f1a', color:'#f0f4ff' }}>

      {/* Top bar */}
      <div style={{ borderBottom:'1px solid #1e2a40', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:22, height:22, background:'#e8eeff', clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', flexShrink:0 }} />
          <div>
            <div style={{ fontSize:11, fontWeight:900, color:'#f0f4ff', letterSpacing:'-0.01em' }}>ByDesign</div>
            <div style={{ fontSize:8, color:'#3d4f6e', letterSpacing:'0.18em', textTransform:'uppercase' }}>Client Portal</div>
          </div>
          <div style={{ width:1, height:28, background:'#1e2a40' }} />
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{client.name}</div>
            {client.company&&<div style={{ fontSize:11, color:'#3d4f6e' }}>{client.company}</div>}
          </div>
        </div>
        <button
          onClick={()=>{ sessionStorage.removeItem('portalClient'); router.push('/portal') }}
          style={navBtn}>
          Sign Out
        </button>
      </div>

      <div style={{ maxWidth:1060, margin:'0 auto', padding:'32px 28px' }}>

        {/* Welcome */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#2a3a55', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Welcome back</div>
          <h1 style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.02em', marginBottom:4 }}>
            {client.name} — Marketing Hub
          </h1>
          <p style={{ fontSize:12, color:'#3d4f6e', lineHeight:1.6 }}>
            View your social and email schedule, active tasks, and submit ideas or requests to your team — all in one place.
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 }}>
          {[
            ['Scheduled Posts',   (client.contentItems||[]).length,                     '#e8eeff' ],
            ['Active Tasks',      taskCount,                                             '#fdab3d' ],
            ['Active Contract',   (client.contracts||[]).length > 0 ? 'Yes' : 'None',   '#00e87a' ],
          ].map(([l,v,c])=>(
            <div key={l as string} style={{ padding:'14px 18px', background:'#111827', border:'1px solid #1e2a40', borderRadius:4 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'#2a3a55', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:800, color:c as string }}>{v as any}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <TabBar tab={tab} setTab={setTab} />

        {/* Tab content */}
        {tab==='social' && <SocialTab client={client} />}
        {tab==='email'  && <EmailTab  client={client} />}
        {tab==='tasks'  && <TasksTab  client={client} />}
        {tab==='ideas'  && <IdeasTab  clientId={client.id} />}

      </div>
    </div>
  )
}
