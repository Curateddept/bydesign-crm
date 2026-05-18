'use client'
import { useState } from 'react'

const STATUS = ['pending','in_progress','done','approved']
const TYPES = ['Post','Reel','Story','Carousel','Caption','Strategy Doc','Analytics Report','Ad Creative','Other']
const PLATFORMS = ['Instagram','TikTok','Facebook','Twitter/X','YouTube','LinkedIn','All Platforms']
const PRIORITIES = ['low','normal','high']

const blank = { title:'', type:'Post', platform:'Instagram', dueDate:'', weekOf:'', status:'pending', priority:'normal', notes:'' }

const statusStyle:Record<string,{chip:string}> = {
  pending:    { chip:'chip-yellow' },
  in_progress:{ chip:'chip-blue' },
  done:       { chip:'chip-green' },
  approved:   { chip:'chip-green' },
}

export default function DeliverablesTab({ client, onRefresh }:{ client:any; onRefresh:()=>void }) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string|null>(null)
  const [form, setForm] = useState({...blank})
  const [filterStatus, setFilterStatus] = useState('all')
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const all = client.deliverables || []
  const items = all.filter((d:any)=> filterStatus==='all'||d.status===filterStatus)
  const counts = STATUS.reduce((acc:any,s)=>({ ...acc, [s]: all.filter((d:any)=>d.status===s).length }),{})

  const save = async () => {
    if (!form.title.trim()) return alert('Title required')
    const payload = { ...form, clientId:client.id }
    if (editing) {
      await fetch(`/api/deliverables/${editing}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setEditing(null)
    } else {
      await fetch('/api/deliverables',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setAdding(false)
    }
    setForm({...blank}); onRefresh()
  }

  const updateStatus = async (id:string, status:string) => {
    await fetch(`/api/deliverables/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) }); onRefresh()
  }

  const del = async (id:string) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/deliverables/${id}`,{ method:'DELETE' }); onRefresh()
  }

  const startEdit = (d:any) => {
    setForm({ title:d.title, type:d.type||'Post', platform:d.platform||'Instagram', dueDate:d.dueDate||'', weekOf:d.weekOf||'', status:d.status, priority:d.priority||'normal', notes:d.notes||'' })
    setEditing(d.id); setAdding(false)
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>To-Do List</span>
          <div style={{ display:'flex', gap:6 }}>
            {[['all', all.length, 'chip-gray'], ['pending', counts.pending, 'chip-yellow'], ['in_progress', counts.in_progress, 'chip-blue'], ['done', counts.done, 'chip-green']].map(([s,n,c])=>(
              <button key={s as string} onClick={()=>setFilterStatus(s as string)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:'3px 2px' }}>
                <span className={`chip ${filterStatus===s?c:'chip-gray'}`}>{s==='in_progress'?'In Progress':String(s).charAt(0).toUpperCase()+String(s).slice(1)} {n}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={()=>{ setAdding(true); setEditing(null); setForm({...blank}) }} className="btn btn-primary btn-sm">+ ADD TASK</button>
      </div>

      {(adding||editing) && (
        <div className="hud-card" style={{ padding:20, marginBottom:18, borderColor:'rgba(255,255,255,0.2)' }}>
          <div className="label" style={{ marginBottom:12 }}>{editing?'Edit Task':'New Task'}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <F label="Title *"><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. 4 Instagram Reels" className="input" /></F>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <F label="Type">
                <select value={form.type} onChange={e=>set('type',e.target.value)} className="input">
                  {TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </F>
              <F label="Platform">
                <select value={form.platform} onChange={e=>set('platform',e.target.value)} className="input">
                  {PLATFORMS.map(p=><option key={p}>{p}</option>)}
                </select>
              </F>
              <F label="Priority">
                <select value={form.priority} onChange={e=>set('priority',e.target.value)} className="input">
                  {PRIORITIES.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
              </F>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <F label="Status">
                <select value={form.status} onChange={e=>set('status',e.target.value)} className="input">
                  {STATUS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </F>
              <F label="Due Date"><input value={form.dueDate} onChange={e=>set('dueDate',e.target.value)} type="date" className="input" /></F>
              <F label="Week Of"><input value={form.weekOf} onChange={e=>set('weekOf',e.target.value)} type="date" className="input" /></F>
            </div>
            <F label="Notes"><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Details..." rows={2} className="input" style={{ resize:'vertical' }} /></F>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={save} className="btn btn-primary btn-sm">SAVE</button>
              <button onClick={()=>{ setAdding(false); setEditing(null) }} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="hud-card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:28, color:'#222', marginBottom:10 }}>◎</div>
          <div style={{ color:'#444', fontSize:13 }}>{all.length===0?'No tasks yet':'Nothing with this status'}</div>
        </div>
      ) : (
        <div className="hud-card" style={{ overflow:'hidden' }}>
          {items.map((d:any, i:number) => {
            const isOverdue = d.dueDate && new Date(d.dueDate) < new Date() && !['done','approved'].includes(d.status)
            const priorityColor = d.priority==='high'?'#ff3366':d.priority==='normal'?'#ffb800':'#555'
            return (
              <div key={d.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', borderBottom: i<items.length-1?'1px solid #111':'none', transition:'background 0.15s' }}
                onMouseEnter={e=>(e.currentTarget.style.background='#111827')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                {/* Priority bar */}
                <div style={{ width:3, height:32, borderRadius:2, background:priorityColor, flexShrink:0 }} />

                {/* Status dropdown */}
                <select value={d.status} onChange={e=>updateStatus(d.id,e.target.value)}
                  style={{ padding:'4px 8px', borderRadius:3, border:'1px solid #1c1c1c', fontSize:10, fontWeight:700, cursor:'pointer', letterSpacing:'0.05em', textTransform:'uppercase',
                    background: d.status==='done'||d.status==='approved'?'rgba(0,255,136,0.08)': d.status==='in_progress'?'rgba(255,255,255,0.08)':'rgba(255,184,0,0.08)',
                    color: d.status==='done'||d.status==='approved'?'#00ff88': d.status==='in_progress'?'#ffffff':'#ffb800',
                    outline:'none', flexShrink:0 }}>
                  {STATUS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:2 }}>{d.title}</div>
                  <div style={{ fontSize:11, color:'#444' }}>
                    {[d.type, d.platform, d.dueDate?`Due ${new Date(d.dueDate).toLocaleDateString()}`:null, d.weekOf?`Week of ${new Date(d.weekOf).toLocaleDateString()}`:null].filter(Boolean).join(' · ')}
                  </div>
                  {d.notes && <div style={{ fontSize:11, color:'#333', marginTop:3 }}>{d.notes}</div>}
                </div>

                {isOverdue && <span className="chip chip-red">Overdue</span>}
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={()=>startEdit(d)} className="btn btn-ghost btn-sm">Edit</button>
                  <button onClick={()=>del(d.id)} className="btn btn-danger btn-sm">✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return <div><label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>{children}</div>
}
