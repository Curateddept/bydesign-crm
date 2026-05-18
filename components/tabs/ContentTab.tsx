'use client'
import { useState, useRef } from 'react'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const PLATFORMS = ['Instagram','TikTok','Facebook','Twitter/X','YouTube','LinkedIn']
const TYPES = ['Post','Reel','Story','Carousel','Video','Thread']
const STATUS_OPTS = ['idea','writing','designed','approved','scheduled','posted']

const STATUS_CHIP:Record<string,string> = {
  idea:'chip-gray', writing:'chip-yellow', designed:'chip-purple',
  approved:'chip-green', scheduled:'chip-blue', posted:'chip-green'
}

const blank = { title:'', caption:'', platform:'Instagram', type:'Reel', dayOfWeek:'Monday', postTime:'09:00', status:'idea', hashtags:'', strategy:'', notes:'' }

export default function ContentTab({ client, onRefresh }:{ client:any; onRefresh:()=>void }) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string|null>(null)
  const [form, setForm] = useState({...blank})
  const [view, setView] = useState<'week'|'list'>('week')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{url:string;name:string;type:string}|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const items:any[] = client.contentItems || []

  const save = async () => {
    if (!form.title.trim()) return alert('Title required')
    const payload:any = { ...form, clientId:client.id }
    if (uploadedFile) { payload.fileUrl=uploadedFile.url; payload.fileName=uploadedFile.name; payload.fileType=uploadedFile.type }
    if (editing) {
      await fetch(`/api/content/${editing}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setEditing(null)
    } else {
      await fetch('/api/content',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setAdding(false)
    }
    setForm({...blank}); setUploadedFile(null); onRefresh()
  }

  const handleFile = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload',{ method:'POST', body:fd })
    const data = await res.json()
    setUploadedFile({ url:data.url, name:file.name, type:file.type })
    setUploading(false)
  }

  const updateStatus = async (id:string, status:string) => {
    await fetch(`/api/content/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ status }) }); onRefresh()
  }

  const del = async (id:string) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/content/${id}`,{ method:'DELETE' }); onRefresh()
  }

  const startEdit = (item:any) => {
    setForm({ title:item.title, caption:item.caption||'', platform:item.platform||'Instagram', type:item.type||'Reel', dayOfWeek:item.dayOfWeek||'Monday', postTime:item.postTime||'09:00', status:item.status, hashtags:item.hashtags||'', strategy:item.strategy||'', notes:item.notes||'' })
    if (item.fileUrl) setUploadedFile({ url:item.fileUrl, name:item.fileName||'attachment', type:item.fileType||'' })
    setEditing(item.id); setAdding(false)
  }

  const getDay = (day:string) => items.filter(i=>i.dayOfWeek===day).sort((a:any,b:any)=>(a.postTime||'').localeCompare(b.postTime||''))

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Content Planner</span>
          <div style={{ display:'flex', background:'#111827', borderRadius:4, border:'1px solid #1c1c1c', padding:3, gap:3 }}>
            <button onClick={()=>setView('week')} className={`btn btn-sm ${view==='week'?'btn-primary':'btn-ghost'}`} style={{ border:'none' }}>Week View</button>
            <button onClick={()=>setView('list')} className={`btn btn-sm ${view==='list'?'btn-primary':'btn-ghost'}`} style={{ border:'none' }}>List</button>
          </div>
        </div>
        <button onClick={()=>{ setAdding(true); setEditing(null); setForm({...blank}); setUploadedFile(null) }} className="btn btn-primary btn-sm">+ ADD POST</button>
      </div>

      {/* Form */}
      {(adding||editing) && (
        <div className="hud-card" style={{ padding:22, marginBottom:20, borderColor:'rgba(255,255,255,0.2)' }}>
          <div className="label" style={{ marginBottom:14 }}>{editing?'Edit Post':'New Post'}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <F label="Post Title *"><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Monday Morning Motivation Reel" className="input" /></F>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
              <F label="Day">
                <select value={form.dayOfWeek} onChange={e=>set('dayOfWeek',e.target.value)} className="input">
                  {DAYS.map(d=><option key={d}>{d}</option>)}
                </select>
              </F>
              <F label="Time">
                <input value={form.postTime} onChange={e=>set('postTime',e.target.value)} type="time" className="input" />
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
              <textarea value={form.caption} onChange={e=>set('caption',e.target.value)} placeholder="Write the post caption here..." rows={4} className="input" style={{ resize:'vertical' }} />
            </F>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <F label="Hashtags">
                <input value={form.hashtags} onChange={e=>set('hashtags',e.target.value)} placeholder="#hashtag1 #hashtag2" className="input" />
              </F>
              <F label="Attachment (Photo / Video)">
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button type="button" onClick={()=>fileRef.current?.click()} className="btn btn-ghost btn-sm" style={{ flexShrink:0 }}>
                    {uploading?'Uploading...':'📎 Upload File'}
                  </button>
                  {uploadedFile && <span style={{ fontSize:11, color:'#00ff88', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>✓ {uploadedFile.name}</span>}
                  <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display:'none' }} />
                </div>
              </F>
            </div>
            <F label="Strategy Notes">
              <textarea value={form.strategy} onChange={e=>set('strategy',e.target.value)} placeholder="Strategy, goal, target audience, talking points..." rows={2} className="input" style={{ resize:'vertical' }} />
            </F>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={save} className="btn btn-primary btn-sm">SAVE POST</button>
              <button onClick={()=>{ setAdding(false); setEditing(null); setUploadedFile(null) }} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Week View */}
      {view==='week' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
          {DAYS.map(day=>{
            const dayItems = getDay(day)
            return (
              <div key={day} style={{ minHeight:180 }}>
                <div style={{ padding:'8px 10px', borderBottom:'1px solid #111', marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:800, color: dayItems.length>0?'#ffffff':'#333', letterSpacing:'0.1em', textTransform:'uppercase' }}>{day.slice(0,3)}</div>
                  {dayItems.length>0 && <div style={{ fontSize:9, color:'#444', marginTop:1 }}>{dayItems.length} post{dayItems.length!==1?'s':''}</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, padding:'0 2px' }}>
                  {dayItems.map(item=>(
                    <div key={item.id} onClick={()=>startEdit(item)}
                      style={{ padding:'8px 10px', background:'#111827', border:'1px solid #1a1a1a', borderRadius:4, cursor:'pointer', borderLeft:`2px solid ${item.status==='posted'?'#00ff88':item.status==='scheduled'?'#7c3aed':item.status==='approved'?'#ffffff':'#333'}`, transition:'border-color 0.15s' }}
                      onMouseEnter={e=>(e.currentTarget.style.borderColor='#333')}
                      onMouseLeave={e=>(e.currentTarget.style.borderLeft=`2px solid ${item.status==='posted'?'#00ff88':item.status==='scheduled'?'#7c3aed':item.status==='approved'?'#ffffff':'#333'}`)}>
                      {item.postTime && <div style={{ fontSize:9, color:'#555', marginBottom:3, fontWeight:700 }}>{item.postTime}</div>}
                      <div style={{ fontSize:11, fontWeight:700, color:'#ccc', lineHeight:1.3, marginBottom:4 }}>{item.title}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:9, color:'#444' }}>{item.platform}</span>
                        <span className={`chip ${STATUS_CHIP[item.status]||'chip-gray'}`} style={{ fontSize:8 }}>{item.status}</span>
                      </div>
                      {item.fileUrl && <div style={{ marginTop:4, fontSize:9, color:'#ffffff' }}>📎 Attachment</div>}
                    </div>
                  ))}
                  {dayItems.length===0 && (
                    <div style={{ padding:'10px 6px', textAlign:'center', color:'#222', fontSize:10, border:'1px dashed #111', borderRadius:4 }}>empty</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view==='list' && (
        items.length===0 ? (
          <div className="hud-card" style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, color:'#222', marginBottom:10 }}>▦</div>
            <div style={{ color:'#444', fontSize:13 }}>No content yet. Click "+ ADD POST" to start planning.</div>
          </div>
        ) : (
          <div className="hud-card" style={{ overflow:'hidden' }}>
            {[...items].sort((a,b)=>DAYS.indexOf(a.dayOfWeek)-DAYS.indexOf(b.dayOfWeek)).map((item,i)=>(
              <div key={item.id} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 18px', borderBottom:i<items.length-1?'1px solid #0d0d0d':'none' }}>
                <div style={{ textAlign:'center', flexShrink:0, minWidth:52 }}>
                  <div style={{ fontSize:9, fontWeight:800, color:'#ffffff', letterSpacing:'0.1em', textTransform:'uppercase' }}>{(item.dayOfWeek||'').slice(0,3)}</div>
                  {item.postTime && <div style={{ fontSize:12, fontWeight:700, color:'#555', fontFamily:'monospace' }}>{item.postTime}</div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <select value={item.status} onChange={e=>updateStatus(item.id,e.target.value)}
                      style={{ background:'transparent', border:'none', outline:'none', cursor:'pointer', padding:0 }}>
                      <option value="" disabled>{item.status}</option>
                      {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className={`chip ${STATUS_CHIP[item.status]||'chip-gray'}`}>{item.status}</span>
                    <span style={{ fontSize:11, color:'#444' }}>{item.platform} · {item.type}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:4 }}>{item.title}</div>
                  {item.caption && <div style={{ fontSize:12, color:'#555', lineHeight:1.5 }}>{item.caption.length>100?item.caption.slice(0,100)+'...':item.caption}</div>}
                  {item.hashtags && <div style={{ fontSize:11, color:'#7c3aed', marginTop:4 }}>{item.hashtags}</div>}
                  {item.strategy && (
                    <div style={{ marginTop:8, padding:'8px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:3 }}>
                      <div className="label" style={{ marginBottom:3 }}>Strategy</div>
                      <div style={{ fontSize:11, color:'#555' }}>{item.strategy}</div>
                    </div>
                  )}
                  {item.fileUrl && (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:6, fontSize:11, color:'#ffffff', textDecoration:'none' }}>
                      📎 {item.fileName||'View Attachment'} ↗
                    </a>
                  )}
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={()=>startEdit(item)} className="btn btn-ghost btn-sm">Edit</button>
                  <button onClick={()=>del(item.id)} className="btn btn-danger btn-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return <div><label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>{children}</div>
}
