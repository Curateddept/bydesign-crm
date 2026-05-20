'use client'
import { useState, useRef, useEffect } from 'react'

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

// ─── SubTask inline panel ─────────────────────────────────────────────────────

function SubTasksPanel({ deliverable, onRefresh }: { deliverable: any; onRefresh: () => void }) {
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding]     = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])

  const subTasks: any[] = deliverable.subTasks || []
  const doneCount = subTasks.filter((s: any) => s.done).length

  const addSubTask = async () => {
    if (!newTitle.trim()) return
    await fetch('/api/subtasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliverableId: deliverable.id, title: newTitle.trim() }),
    })
    setNewTitle('')
    onRefresh()
  }

  const toggleDone = async (sub: any) => {
    await fetch(`/api/subtasks/${sub.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !sub.done }),
    })
    onRefresh()
  }

  const deleteSub = async (id: string) => {
    await fetch(`/api/subtasks/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div style={{ marginTop: 10, marginLeft: 14, paddingLeft: 14, borderLeft: '2px solid #1e2a40' }}>
      {/* Progress bar */}
      {subTasks.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 3, background: '#1a1a2e', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: doneCount === subTasks.length ? '#00ff88' : '#3b82f6',
              width: `${subTasks.length > 0 ? (doneCount / subTasks.length) * 100 : 0}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: 10, color: '#3d4f6e', flexShrink: 0 }}>
            {doneCount}/{subTasks.length} done
          </span>
        </div>
      )}

      {/* Sub-task list */}
      {subTasks.map((sub: any) => (
        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #0d1424' }}>
          <button
            onClick={() => toggleDone(sub)}
            style={{
              width: 16, height: 16, borderRadius: 3, flexShrink: 0,
              border: `1.5px solid ${sub.done ? '#00ff88' : '#2a3a55'}`,
              background: sub.done ? 'rgba(0,255,136,0.15)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            {sub.done && <span style={{ fontSize: 9, color: '#00ff88', lineHeight: 1 }}>✓</span>}
          </button>
          <span style={{
            flex: 1, fontSize: 12,
            color: sub.done ? '#3d4f6e' : '#bcc8e0',
            textDecoration: sub.done ? 'line-through' : 'none',
            transition: 'all 0.15s',
          }}>
            {sub.title}
          </span>
          <button
            onClick={() => deleteSub(sub.id)}
            className="sub-del-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a3a55', fontSize: 11, padding: '0 4px' }}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add sub-task */}
      {adding ? (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addSubTask()
              if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
            }}
            placeholder="Sub-task title…"
            style={{
              flex: 1, background: '#0b0f1a', border: '1px solid #1e2a40',
              borderRadius: 3, color: '#e8eeff', fontSize: 12,
              padding: '5px 10px', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={addSubTask}
            disabled={!newTitle.trim()}
            style={{
              padding: '5px 12px', background: '#1e2a40', border: 'none',
              borderRadius: 3, color: '#e8eeff', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', opacity: newTitle.trim() ? 1 : 0.4,
            }}
          >
            Add
          </button>
          <button
            onClick={() => { setAdding(false); setNewTitle('') }}
            style={{ padding: '5px 8px', background: 'none', border: 'none', borderRadius: 3, color: '#3d4f6e', fontSize: 11, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            marginTop: subTasks.length > 0 ? 8 : 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#2a3a55', fontSize: 11, padding: '3px 0',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#8a99b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#2a3a55')}
        >
          + add sub-task
        </button>
      )}
    </div>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function DeliverablesTab({ client, onRefresh }:{ client:any; onRefresh:()=>void }) {
  const [adding, setAdding]             = useState(false)
  const [editing, setEditing]           = useState<string|null>(null)
  const [form, setForm]                 = useState({...blank})
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded]         = useState<Set<string>>(new Set())
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const all   = client.deliverables || []
  const items = all.filter((d:any)=> filterStatus==='all'||d.status===filterStatus)
  const counts = STATUS.reduce((acc:any,s)=>({ ...acc, [s]: all.filter((d:any)=>d.status===s).length }),{})

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

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
            const isOverdue     = d.dueDate && new Date(d.dueDate) < new Date() && !['done','approved'].includes(d.status)
            const priorityColor = d.priority==='high'?'#ff3366':d.priority==='normal'?'#ffb800':'#555'
            const subTasks: any[]  = d.subTasks || []
            const doneCount  = subTasks.filter((s:any) => s.done).length
            const isExpanded = expanded.has(d.id)

            return (
              <div key={d.id} style={{ borderBottom: i<items.length-1?'1px solid #111':'none' }}>
                {/* Main row */}
                <div
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 18px', transition:'background 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='#111827')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                >
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
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, color:'#444' }}>
                        {[d.type, d.platform, d.dueDate?`Due ${new Date(d.dueDate).toLocaleDateString()}`:null, d.weekOf?`Week of ${new Date(d.weekOf).toLocaleDateString()}`:null].filter(Boolean).join(' · ')}
                      </span>
                      {subTasks.length > 0 && (
                        <span style={{
                          fontSize:9, fontWeight:700, letterSpacing:'0.06em',
                          color: doneCount===subTasks.length ? '#00ff88' : '#3d4f6e',
                          background: doneCount===subTasks.length ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${doneCount===subTasks.length ? 'rgba(0,255,136,0.2)' : '#1e2a40'}`,
                          borderRadius:3, padding:'2px 6px',
                        }}>
                          {doneCount}/{subTasks.length} sub-tasks
                        </span>
                      )}
                    </div>
                    {d.notes && <div style={{ fontSize:11, color:'#333', marginTop:3 }}>{d.notes}</div>}
                  </div>

                  {isOverdue && <span className="chip chip-red">Overdue</span>}

                  {/* Expand sub-tasks toggle */}
                  <button
                    onClick={() => toggleExpand(d.id)}
                    style={{
                      background: isExpanded ? 'rgba(59,130,246,0.1)' : 'none',
                      border: `1px solid ${isExpanded ? '#3b82f6' : '#1e2a40'}`,
                      borderRadius: 3, cursor: 'pointer',
                      color: isExpanded ? '#3b82f6' : '#2a3a55',
                      fontSize: 10, fontWeight: 700, padding: '4px 9px', flexShrink: 0,
                      letterSpacing: '0.05em', transition: 'all 0.15s',
                    }}
                  >
                    {isExpanded ? '▲' : '▼'} TASKS{subTasks.length > 0 ? ` ${doneCount}/${subTasks.length}` : ''}
                  </button>

                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button onClick={()=>startEdit(d)} className="btn btn-ghost btn-sm">Edit</button>
                    <button onClick={()=>del(d.id)} className="btn btn-danger btn-sm">✕</button>
                  </div>
                </div>

                {/* Sub-tasks panel */}
                {isExpanded && (
                  <div style={{ padding:'0 18px 14px 18px', background:'#0a0e1a' }}>
                    <SubTasksPanel deliverable={d} onRefresh={onRefresh} />
                  </div>
                )}
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
