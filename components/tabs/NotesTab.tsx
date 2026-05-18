'use client'
import { useState, useEffect } from 'react'

const blank = { content:'', type:'note', priority:'normal', status:'open', reminderAt:'' }

export default function NotesTab({ client, onRefresh }:{ client:any; onRefresh:()=>void }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({...blank})
  const [filter, setFilter] = useState('all')
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const notes:any[] = client.clientNotes || []
  const items = notes.filter(n => filter==='all'||(filter==='todo'&&n.type==='todo'&&n.status==='open')||(filter==='note'&&n.type==='note')||(filter==='done'&&n.status==='done'))

  const save = async () => {
    if (!form.content.trim()) return
    await fetch('/api/notes',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...form, clientId:client.id }) })
    setForm({...blank}); setAdding(false); onRefresh()
  }

  const toggle = async (n:any) => {
    const status = n.status==='done'?'open':'done'
    await fetch(`/api/notes/${n.id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) }); onRefresh()
  }

  const del = async (id:string) => {
    await fetch(`/api/notes/${id}`,{ method:'DELETE' }); onRefresh()
  }

  // Check for due reminders
  const reminders = notes.filter(n => n.reminderAt && n.status==='open' && new Date(n.reminderAt) <= new Date())

  const openTodos = notes.filter(n=>n.type==='todo'&&n.status==='open').length
  const totalNotes = notes.filter(n=>n.type==='note').length

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Notes & Reminders</span>
          <div style={{ display:'flex', gap:6 }}>
            {[['all','All'],['todo','Open Tasks'],['note','Notes'],['done','Done']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} className={`chip ${filter===v?'chip-blue':'chip-gray'}`} style={{ cursor:'pointer', border:'none', background:undefined }}>{l}</button>
            ))}
          </div>
        </div>
        <button onClick={()=>setAdding(a=>!a)} className="btn btn-primary btn-sm">+ ADD</button>
      </div>

      {/* Reminder alerts */}
      {reminders.map(r=>(
        <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:4, marginBottom:10 }}>
          <span style={{ fontSize:14 }}>⏰</span>
          <span style={{ fontSize:12, color:'#ffb800', flex:1 }}>Reminder: {r.content.slice(0,80)}{r.content.length>80?'...':''}</span>
          <button onClick={()=>toggle(r)} className="btn btn-ghost btn-sm">Mark Done</button>
        </div>
      ))}

      {adding && (
        <div className="hud-card" style={{ padding:20, marginBottom:16, borderColor:'rgba(255,255,255,0.2)' }}>
          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            {['note','todo'].map(t=>(
              <button key={t} onClick={()=>set('type',t)} className={`btn btn-sm ${form.type===t?'btn-primary':'btn-ghost'}`} style={{ textTransform:'capitalize' }}>{t==='todo'?'To-Do':'Note'}</button>
            ))}
          </div>
          <textarea value={form.content} onChange={e=>set('content',e.target.value)}
            placeholder={form.type==='todo'?'What needs to be done for this client?':'Write a note about this client...'}
            rows={3} className="input" style={{ resize:'vertical', marginBottom:10 }} autoFocus />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <F label="Priority">
              <select value={form.priority} onChange={e=>set('priority',e.target.value)} className="input">
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
              </select>
            </F>
            <F label="Reminder (optional)">
              <input value={form.reminderAt} onChange={e=>set('reminderAt',e.target.value)} type="datetime-local" className="input" />
            </F>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} className="btn btn-primary btn-sm">SAVE</button>
            <button onClick={()=>setAdding(false)} className="btn btn-ghost btn-sm">Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="hud-card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:28, color:'#222', marginBottom:10 }}>✦</div>
          <div style={{ color:'#444', fontSize:13 }}>No {filter==='all'?'notes or tasks':filter} yet</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {items.map((n:any)=>{
            const priorityColor = n.priority==='high'?'#ff3366':n.priority==='normal'?'#ffb800':'#333'
            const isDone = n.status==='done'
            const hasReminder = n.reminderAt && new Date(n.reminderAt) > new Date() && !isDone
            return (
              <div key={n.id} className="hud-card" style={{ padding:'14px 18px', opacity: isDone?0.5:1, transition:'opacity 0.2s' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  {/* Checkbox / type indicator */}
                  {n.type==='todo' ? (
                    <button onClick={()=>toggle(n)} style={{
                      width:18, height:18, borderRadius:3, border:`1px solid ${isDone?'#00ff88':'#333'}`,
                      background: isDone?'#00ff88':'transparent', cursor:'pointer', flexShrink:0, marginTop:2,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#000'
                    }}>{isDone?'✓':''}</button>
                  ) : (
                    <div style={{ width:18, height:18, borderRadius:3, background:'#182035', border:'1px solid #222', flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#555' }}>✦</div>
                  )}

                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, color:isDone?'#444':'#ccc', lineHeight:1.6, textDecoration:isDone?'line-through':'none', marginBottom:4 }}>{n.content}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      <span className={`chip ${n.priority==='high'?'chip-red':n.priority==='normal'?'chip-yellow':'chip-gray'}`}>{n.priority}</span>
                      <span className={`chip ${n.type==='todo'?'chip-blue':'chip-gray'}`}>{n.type==='todo'?'Task':'Note'}</span>
                      {hasReminder && <span className="chip chip-yellow">⏰ {new Date(n.reminderAt).toLocaleDateString()} {new Date(n.reminderAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>}
                      <span style={{ fontSize:10, color:'#333' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button onClick={()=>del(n.id)} className="btn btn-danger btn-sm" style={{ flexShrink:0 }}>✕</button>
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
