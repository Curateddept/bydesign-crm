'use client'
import { useEffect, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const GROUP_COLORS = [
  '#e44332','#fdab3d','#00c875','#1f76c2','#a25ddc',
  '#ff7575','#037f4c','#cab641','#ff5ac4','#0086c0',
  '#9aadbd','#78909c','#e2445c','#33b679','#4285f4',
]

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending:     { label: 'Pending',       bg: 'rgba(100,100,100,0.25)', color: '#888'    },
  in_progress: { label: 'Working on it', bg: 'rgba(253,171,61,0.2)',   color: '#fdab3d' },
  stuck:       { label: 'Stuck',         bg: 'rgba(228,67,50,0.2)',    color: '#e44332' },
  done:        { label: 'Done',          bg: 'rgba(0,200,117,0.2)',    color: '#00c875' },
  approved:    { label: 'Approved',      bg: 'rgba(162,93,220,0.2)',   color: '#a25ddc' },
}

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  rush:   { label: 'RUSH',   color: '#e44332' },
  high:   { label: 'HIGH',   color: '#fdab3d' },
  medium: { label: 'MEDIUM', color: '#a25ddc' },
  normal: { label: 'NORMAL', color: '#333'    },
  low:    { label: 'LOW',    color: '#444'    },
}

const STATUSES   = Object.keys(STATUS_META)
const PRIORITIES = ['rush','high','medium','normal','low']

function fmtDate(s?: string | null) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

function isOverdue(dueDate?: string | null, status?: string) {
  if (!dueDate || status === 'done' || status === 'approved') return false
  return new Date(dueDate + 'T23:59:59') < new Date()
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, color, onUpdate, onDelete }: {
  task: any; color: string
  onUpdate: (id: string, patch: any) => void
  onDelete: (id: string) => void
}) {
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle]         = useState(task.title)
  const overdue = isOverdue(task.dueDate, task.status)
  const done    = task.status === 'done' || task.status === 'approved'
  const sm      = STATUS_META[task.status] || STATUS_META.pending
  const pm      = PRIORITY_META[task.priority] || PRIORITY_META.normal

  const commitTitle = () => {
    setEditTitle(false)
    const t = title.trim()
    if (t && t !== task.title) onUpdate(task.id, { title: t })
    else setTitle(task.title)
  }

  return (
    <div style={{
      background: '#111827', border: '1px solid #1a2440', borderRadius: 6,
      padding: '10px 12px', marginBottom: 6, position: 'relative',
      borderLeft: `3px solid ${color}`, transition: 'border-color 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
    onMouseLeave={e => (e.currentTarget.style.borderColor = color)}
    >
      {/* Title row */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8 }}>
        {/* Checkbox */}
        <button onClick={() => onUpdate(task.id, { status: done ? 'pending' : 'done' })}
          style={{
            width:15, height:15, borderRadius:3, flexShrink:0, marginTop:1,
            border:`1.5px solid ${done ? color : '#2a3a55'}`,
            background: done ? color : 'transparent', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:8, color:'#000', transition:'all 0.12s',
          }}>{done ? '✓' : ''}</button>

        {/* Title */}
        {editTitle ? (
          <input value={title} onChange={e => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => { if(e.key==='Enter') commitTitle(); if(e.key==='Escape'){ setTitle(task.title); setEditTitle(false) } }}
            autoFocus
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:12, fontWeight:600, lineHeight:1.4 }}
          />
        ) : (
          <span onClick={() => setEditTitle(true)} style={{
            flex:1, fontSize:12, fontWeight:600, cursor:'text', lineHeight:1.4,
            color: done ? '#3a4a5e' : overdue ? '#e44332' : '#e8eeff',
            textDecoration: done ? 'line-through' : 'none',
          }}>{task.title}</span>
        )}

        {/* Delete */}
        <button onClick={() => onDelete(task.id)}
          style={{ background:'none', border:'none', color:'#1e2a40', fontSize:11, cursor:'pointer', padding:0, flexShrink:0, lineHeight:1 }}
          onMouseEnter={e => (e.currentTarget.style.color='#e44332')}
          onMouseLeave={e => (e.currentTarget.style.color='#1e2a40')}
        >✕</button>
      </div>

      {/* Status */}
      <select value={task.status} onChange={e => onUpdate(task.id, { status: e.target.value })}
        style={{
          width:'100%', padding:'3px 7px', borderRadius:4, border:'none', outline:'none',
          cursor:'pointer', fontSize:10, fontWeight:700, background:sm.bg, color:sm.color,
          marginBottom:6,
        }}>
        {STATUSES.map(s => (
          <option key={s} value={s} style={{ background:'#182035', color:'#fff' }}>{STATUS_META[s].label}</option>
        ))}
      </select>

      {/* Dates + Priority row */}
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
        {/* Start By */}
        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
          <span style={{ fontSize:9, color:'#2a3a55', letterSpacing:'0.06em', textTransform:'uppercase' }}>Start</span>
          <input type="date" value={task.weekOf||''} onChange={e => onUpdate(task.id, { weekOf: e.target.value||null })}
            style={{ background:'transparent', border:'none', outline:'none', color: task.weekOf ? '#6a7f9e' : '#1e2a40', fontSize:10, cursor:'pointer', width:100 }}
          />
        </div>
        {/* Due */}
        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
          <span style={{ fontSize:9, color:'#2a3a55', letterSpacing:'0.06em', textTransform:'uppercase' }}>Due</span>
          <input type="date" value={task.dueDate||''} onChange={e => onUpdate(task.id, { dueDate: e.target.value||null })}
            style={{ background:'transparent', border:'none', outline:'none', color: overdue ? '#e44332' : task.dueDate ? '#6a7f9e' : '#1e2a40', fontSize:10, fontWeight: overdue ? 700 : 400, cursor:'pointer', width:100 }}
          />
        </div>
        {/* Priority */}
        <select value={task.priority||'normal'} onChange={e => onUpdate(task.id, { priority: e.target.value })}
          style={{ background:'transparent', border:'none', outline:'none', color:pm.color, fontSize:9, fontWeight:800, cursor:'pointer', letterSpacing:'0.06em', marginLeft:'auto' }}>
          {PRIORITIES.map(p => (
            <option key={p} value={p} style={{ background:'#182035', color:'#fff' }}>{PRIORITY_META[p].label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ─── Client Column ────────────────────────────────────────────────────────────

function ClientColumn({ name, color, clientId, tasks, onUpdate, onDelete, onAdd }: {
  name: string; color: string; clientId: string | null; tasks: any[]
  onUpdate: (id:string, patch:any)=>void
  onDelete: (id:string)=>void
  onAdd: (cid:string|null, title:string)=>void
}) {
  const [addActive, setAddActive] = useState(false)
  const [addVal, setAddVal]       = useState('')

  const submit = () => {
    if (addVal.trim()) { onAdd(clientId, addVal.trim()); setAddVal('') }
    setAddActive(false)
  }

  const open  = tasks.filter(t => t.status !== 'done' && t.status !== 'approved').length
  const stuck = tasks.filter(t => t.status === 'stuck').length
  const done  = tasks.filter(t => t.status === 'done' || t.status === 'approved').length

  return (
    <div style={{
      width: 290, flexShrink: 0, display:'flex', flexDirection:'column',
      background: '#0d1220', border: '1px solid #1a2440', borderRadius: 8,
      borderTop: `3px solid ${color}`, overflow:'hidden',
    }}>
      {/* Column Header */}
      <div style={{ padding:'12px 14px 10px', borderBottom:'1px solid #131e30', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:color, flexShrink:0 }} />
          <span style={{ fontSize:12, fontWeight:800, color:'#e8eeff', letterSpacing:'-0.01em', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
          <span style={{ fontSize:10, color:'#2a3a55', fontWeight:700 }}>{tasks.length}</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {open   > 0 && <span style={{ fontSize:9, fontWeight:700, color:'#fdab3d', background:'rgba(253,171,61,0.12)', borderRadius:3, padding:'2px 5px' }}>{open} open</span>}
          {stuck  > 0 && <span style={{ fontSize:9, fontWeight:700, color:'#e44332', background:'rgba(228,67,50,0.12)', borderRadius:3, padding:'2px 5px' }}>{stuck} stuck</span>}
          {done   > 0 && <span style={{ fontSize:9, fontWeight:700, color:'#00c875', background:'rgba(0,200,117,0.1)',  borderRadius:3, padding:'2px 5px' }}>{done} done</span>}
        </div>
      </div>

      {/* Tasks — scrollable */}
      <div style={{ flex:1, overflowY:'auto', padding:'10px 10px 4px', minHeight:0 }}>
        {tasks.length === 0 && (
          <div style={{ fontSize:11, color:'#1e2a40', textAlign:'center', padding:'20px 0', letterSpacing:'0.04em' }}>No tasks</div>
        )}
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} color={color} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>

      {/* Add task */}
      <div style={{ padding:'6px 10px 10px', flexShrink:0, borderTop:'1px solid #0d1525' }}>
        {addActive ? (
          <div style={{ display:'flex', gap:6 }}>
            <input value={addVal} onChange={e => setAddVal(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter') submit(); if(e.key==='Escape'){ setAddActive(false); setAddVal('') } }}
              onBlur={() => { if(!addVal.trim()) setAddActive(false) }}
              autoFocus placeholder="Task name..."
              style={{ flex:1, background:'#111827', border:'1px solid #1e2a40', borderRadius:4, outline:'none', color:'#fff', fontSize:11, padding:'5px 8px' }}
            />
            <button onClick={submit} disabled={!addVal.trim()}
              style={{ background:'#fff', color:'#000', border:'none', borderRadius:4, fontSize:10, fontWeight:800, padding:'5px 10px', cursor:'pointer', opacity: addVal.trim()?1:0.3 }}>
              Add
            </button>
          </div>
        ) : (
          <button onClick={() => setAddActive(true)}
            style={{ background:'none', border:'none', color:'#2a3a55', fontSize:11, cursor:'pointer', padding:'4px 2px', display:'flex', alignItems:'center', gap:5, width:'100%', letterSpacing:'0.02em' }}
            onMouseEnter={e => (e.currentTarget.style.color='#6a7f9e')}
            onMouseLeave={e => (e.currentTarget.style.color='#2a3a55')}
          >
            <span style={{ fontSize:14 }}>+</span> Add task
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TodosPage() {
  const [items,   setItems]   = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Modal state
  const [modal,     setModal]     = useState(false)
  const [mTitle,    setMTitle]    = useState('')
  const [mClient,   setMClient]   = useState('')
  const [mStart,    setMStart]    = useState('')
  const [mDue,      setMDue]      = useState('')
  const [mPriority, setMPriority] = useState('normal')

  const load = () =>
    Promise.all([
      fetch('/api/deliverables').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([d, c]) => {
      setItems(Array.isArray(d) ? d : [])
      setClients(Array.isArray(c) ? c : [])
      setLoading(false)
    })

  useEffect(() => { load() }, [])

  const update = async (id: string, patch: any) => {
    await fetch(`/api/deliverables/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    load()
  }

  const del = async (id: string) => {
    await fetch(`/api/deliverables/${id}`, { method: 'DELETE' })
    load()
  }

  const addTask = async (clientId: string | null, title: string, extra?: any) => {
    await fetch('/api/deliverables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, clientId: clientId||null, status:'pending', priority:'normal', ...extra }),
    })
    load()
  }

  const submitModal = async () => {
    if (!mTitle.trim()) return
    await addTask(mClient||null, mTitle.trim(), {
      weekOf: mStart||null, dueDate: mDue||null, priority: mPriority,
    })
    setMTitle(''); setMClient(''); setMStart(''); setMDue(''); setMPriority('normal')
    setModal(false)
  }

  // Filter
  const filtered = items.filter(d => {
    const ms = filterStatus === 'all' || d.status === filterStatus
    const mt = !search.trim() || d.title.toLowerCase().includes(search.toLowerCase())
    return ms && mt
  })

  // Build columns — one per active client + General
  const activeClients = clients.filter(c => c.status === 'active')
  const columns = [
    ...activeClients.map((c, i) => ({
      key: c.id, name: c.name,
      clientId: c.id,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
      tasks: filtered.filter(d => d.clientId === c.id),
    })),
    {
      key: 'general', name: 'General',
      clientId: null as string | null,
      color: '#4a5568',
      tasks: filtered.filter(d => !d.clientId),
    },
  ]

  const totalOpen    = items.filter(d => d.status !== 'done' && d.status !== 'approved').length
  const totalDone    = items.filter(d => d.status === 'done'  || d.status === 'approved').length
  const totalStuck   = items.filter(d => d.status === 'stuck').length
  const totalOverdue = items.filter(d => isOverdue(d.dueDate, d.status)).length

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#333' }}>Loading...</div>

  return (
    <div className="animate-fadeIn" style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 40px)', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexShrink:0 }}>
        <div>
          <div className="label" style={{ marginBottom:4 }}>Task Management</div>
          <h1 style={{ fontSize:24, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>Task Board</h1>
          <p style={{ color:'#555', fontSize:11, marginTop:3 }}>
            {totalOpen} open &nbsp;·&nbsp; {totalDone} done
            {totalStuck  > 0 && <span style={{ color:'#e44332' }}>&nbsp;·&nbsp;{totalStuck} stuck</span>}
            {totalOverdue > 0 && <span style={{ color:'#e44332' }}>&nbsp;·&nbsp;{totalOverdue} overdue</span>}
          </p>
        </div>
        <button onClick={() => setModal(true)} className="btn btn-primary" style={{ marginTop:4, fontSize:11 }}>
          + New Task
        </button>
      </div>

      {/* Stat pills */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14, flexShrink:0 }}>
        {([
          ['Open',    totalOpen,    '#fdab3d'],
          ['Done',    totalDone,    '#00c875'],
          ['Stuck',   totalStuck,   '#e44332'],
          ['Overdue', totalOverdue, '#e44332'],
        ] as [string,number,string][]).map(([l,v,c]) => (
          <div key={l} className="hud-card" style={{ padding:'10px 14px' }}>
            <div className="label" style={{ marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:20, fontWeight:800, color: v > 0 ? c : '#222' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center', flexShrink:0 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search tasks..." className="input" style={{ maxWidth:200, fontSize:11 }} />
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {([['all','All'],['pending','Pending'],['in_progress','Working'],['stuck','Stuck'],['done','Done'],['approved','Approved']] as [string,string][]).map(([v,l]) => (
            <button key={v} onClick={()=>setFilterStatus(v)}
              className={`btn btn-sm ${filterStatus===v?'btn-primary':'btn-ghost'}`}
              style={{ fontSize:10 }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Board — horizontal scroll */}
      <div style={{
        flex:1, overflowX:'auto', overflowY:'hidden',
        display:'flex', gap:12, alignItems:'flex-start',
        paddingBottom:16,
      }}>
        {columns.map(col => (
          <ClientColumn
            key={col.key}
            name={col.name}
            color={col.color}
            clientId={col.clientId}
            tasks={col.tasks}
            onUpdate={update}
            onDelete={del}
            onAdd={addTask}
          />
        ))}
      </div>

      {/* New Task Modal */}
      {modal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.88)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
        }} onClick={e=>{ if(e.target===e.currentTarget) setModal(false) }}>
          <div style={{
            background:'#111827', border:'1px solid #1e2a40', borderRadius:8,
            width:'min(500px,95vw)', padding:28,
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:'#fff' }}>New Task</h2>
              <button onClick={()=>setModal(false)} style={{ background:'none', border:'none', color:'#555', fontSize:18, cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <div className="label" style={{ marginBottom:6 }}>Task Name *</div>
                <input value={mTitle} onChange={e=>setMTitle(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&submitModal()}
                  className="input" placeholder="What needs to be done?" autoFocus />
              </div>
              <div>
                <div className="label" style={{ marginBottom:6 }}>Client</div>
                <select value={mClient} onChange={e=>setMClient(e.target.value)} className="input">
                  <option value="">General (no client)</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div className="label" style={{ marginBottom:6 }}>Priority</div>
                <select value={mPriority} onChange={e=>setMPriority(e.target.value)} className="input">
                  {PRIORITIES.map(p=>(
                    <option key={p} value={p}>{PRIORITY_META[p].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="label" style={{ marginBottom:6 }}>Start By</div>
                <input type="date" value={mStart} onChange={e=>setMStart(e.target.value)} className="input" />
              </div>
              <div>
                <div className="label" style={{ marginBottom:6 }}>Finish By</div>
                <input type="date" value={mDue} onChange={e=>setMDue(e.target.value)} className="input" />
              </div>
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:22 }}>
              <button onClick={()=>setModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={submitModal} disabled={!mTitle.trim()} className="btn btn-primary"
                style={{ opacity: mTitle.trim()?1:0.4 }}>
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
