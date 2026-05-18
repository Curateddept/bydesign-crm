'use client'
import { useState } from 'react'

const blank = { title:'', value:'', startDate:'', endDate:'', status:'active', paymentTerms:'', scope:'', notes:'' }

export default function ContractsTab({ client, onRefresh }:{ client:any; onRefresh:()=>void }) {
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string|null>(null)
  const [form, setForm] = useState({...blank})
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    if (!form.title.trim()) return alert('Title required')
    const payload = { ...form, value: form.value ? parseFloat(form.value) : null, clientId: client.id }
    if (editing) {
      await fetch(`/api/contracts/${editing}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setEditing(null)
    } else {
      await fetch('/api/contracts',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      setAdding(false)
    }
    setForm({...blank}); onRefresh()
  }

  const del = async (id:string) => {
    if (!confirm('Delete this contract?')) return
    await fetch(`/api/contracts/${id}`,{ method:'DELETE' }); onRefresh()
  }

  const startEdit = (c:any) => {
    setForm({ title:c.title, value:c.value||'', startDate:c.startDate||'', endDate:c.endDate||'', status:c.status, paymentTerms:c.paymentTerms||'', scope:c.scope||'', notes:c.notes||'' })
    setEditing(c.id); setAdding(false)
  }

  const contracts = client.contracts || []
  const totalValue = contracts.filter((c:any)=>c.status==='active').reduce((s:number,c:any)=>s+(c.value||0),0)

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <span style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Contracts</span>
          {totalValue > 0 && <span style={{ marginLeft:12, fontSize:13, fontWeight:700, color:'#00ff88' }}>${totalValue.toLocaleString()}/mo active</span>}
        </div>
        <button onClick={()=>{ setAdding(true); setEditing(null); setForm({...blank}) }} className="btn btn-primary btn-sm">+ ADD CONTRACT</button>
      </div>

      {(adding||editing) && (
        <div className="hud-card" style={{ padding:22, marginBottom:20, borderColor:'rgba(255,255,255,0.2)' }}>
          <div className="label" style={{ marginBottom:14 }}>{editing?'Edit Contract':'New Contract'}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <F label="Title *"><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Monthly Social Media Management" className="input" /></F>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <F label="Monthly Value ($)"><input value={form.value} onChange={e=>set('value',e.target.value)} type="number" placeholder="0" className="input" /></F>
              <F label="Start Date"><input value={form.startDate} onChange={e=>set('startDate',e.target.value)} type="date" className="input" /></F>
              <F label="End Date"><input value={form.endDate} onChange={e=>set('endDate',e.target.value)} type="date" className="input" /></F>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <F label="Status">
                <select value={form.status} onChange={e=>set('status',e.target.value)} className="input">
                  {['active','draft','expired','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </F>
              <F label="Payment Terms"><input value={form.paymentTerms} onChange={e=>set('paymentTerms',e.target.value)} placeholder="Net 15, 1st of month..." className="input" /></F>
            </div>
            <F label="Scope of Work"><textarea value={form.scope} onChange={e=>set('scope',e.target.value)} placeholder="What's included..." rows={3} className="input" style={{ resize:'vertical' }} /></F>
            <F label="Notes"><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Internal notes..." rows={2} className="input" style={{ resize:'vertical' }} /></F>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={save} className="btn btn-primary btn-sm">SAVE</button>
              <button onClick={()=>{ setAdding(false); setEditing(null) }} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {contracts.length === 0 && !adding ? (
        <div className="hud-card" style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:28, color:'#222', marginBottom:10 }}>◈</div>
          <div style={{ color:'#444', fontSize:13 }}>No contracts yet</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {contracts.map((c:any) => {
            const statusColor = c.status==='active'?'#00ff88':c.status==='draft'?'#555':'#ff3366'
            const isExpired = c.endDate && new Date(c.endDate) < new Date()
            return (
              <div key={c.id} className="hud-card" style={{ padding:'18px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{c.title}</span>
                      <span className={`chip ${c.status==='active'?'chip-green':c.status==='draft'?'chip-gray':'chip-red'}`}>{c.status}</span>
                      {isExpired && c.status==='active' && <span className="chip chip-yellow">Expired</span>}
                    </div>
                    <div style={{ display:'flex', gap:20, fontSize:12, color:'#555', flexWrap:'wrap' }}>
                      {c.value && <span style={{ color:'#00ff88', fontWeight:700, fontSize:14 }}>${Number(c.value).toLocaleString()}/mo</span>}
                      {c.startDate && <span>Start: {new Date(c.startDate).toLocaleDateString()}</span>}
                      {c.endDate && <span style={{ color:isExpired?'#ff3366':'#555' }}>End: {new Date(c.endDate).toLocaleDateString()}</span>}
                      {c.paymentTerms && <span>Terms: {c.paymentTerms}</span>}
                    </div>
                    {c.scope && <p style={{ fontSize:12, color:'#555', marginTop:10, lineHeight:1.6 }}>{c.scope}</p>}
                  </div>
                  <div style={{ display:'flex', gap:6, marginLeft:16 }}>
                    <button onClick={()=>startEdit(c)} className="btn btn-ghost btn-sm">Edit</button>
                    <button onClick={()=>del(c.id)} className="btn btn-danger btn-sm">✕</button>
                  </div>
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
