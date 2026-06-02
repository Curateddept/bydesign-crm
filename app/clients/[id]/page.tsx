'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ContractsTab from '@/components/tabs/ContractsTab'
import DeliverablesTab from '@/components/tabs/DeliverablesTab'
import ContentTab from '@/components/tabs/ContentTab'
import EmailTab from '@/components/tabs/EmailTab'
import AnalyticsTab from '@/components/tabs/AnalyticsTab'
import NotesTab from '@/components/tabs/NotesTab'

const TABS = ['Overview','Contracts','To-Do','Social Calendar','Email','Analytics','Notes']

export default function ClientDetailPage() {
  const { id } = useParams<{ id:string }>()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [tab, setTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const load = () => fetch(`/api/clients/${id}`).then(r=>r.json()).then(d=>{ setClient(d); setForm(d); setLoading(false) })
  useEffect(()=>{ load() },[id])

  const save = async () => {
    setSaving(true)
    const { contracts,deliverables,analytics,contentItems,clientNotes,_count,createdAt,updatedAt,...rest } = form
    await fetch(`/api/clients/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(rest) })
    setSaving(false); setEditing(false); load()
  }
  const del = async () => {
    if (!confirm(`Delete ${client.name}? All data will be removed.`)) return
    await fetch(`/api/clients/${id}`,{ method:'DELETE' })
    router.push('/clients')
  }

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#333' }}>Loading...</div>
  if (!client||client.error) return <div style={{ textAlign:'center', padding:60, color:'#555' }}>Client not found.</div>

  const set = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}))
  const statusColor = client.status==='active'?'#00ff88':client.status==='paused'?'#ffb800':'#ff3366'
  const today = new Date().getDate()
  const paymentDue = client.paymentDueDay && Math.abs(today - client.paymentDueDay) <= 3

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <Link href="/clients" style={{ fontSize:11, color:'#555', textDecoration:'none', letterSpacing:'0.05em', display:'inline-block', marginBottom:16 }}>← CLIENTS</Link>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:52, height:52, borderRadius:4, background:'#111827', border:`1px solid ${statusColor}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:statusColor }}>
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>{client.name}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {client.company && <span style={{ fontSize:12, color:'#555' }}>{client.company}</span>}
              <span className={`status-dot ${client.status}`} />
              <span style={{ fontSize:11, color:statusColor, textTransform:'capitalize', fontWeight:600 }}>{client.status}</span>
              {client.monthlyRate && <span style={{ fontSize:13, fontWeight:800, color:'#00ff88' }}>${Number(client.monthlyRate).toLocaleString()}/mo</span>}
              {paymentDue && <span className="chip chip-yellow">Payment Due Day {client.paymentDueDay}</span>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {editing
            ? <><button onClick={save} disabled={saving} className="btn btn-primary btn-sm">{saving?'Saving...':'SAVE'}</button>
                <button onClick={()=>setEditing(false)} className="btn btn-ghost btn-sm">Cancel</button></>
            : <button onClick={()=>setEditing(true)} className="btn btn-ghost btn-sm">Edit Client</button>
          }
          <button
            onClick={()=>setTab('Email')}
            className="btn btn-ghost btn-sm"
            style={{ color:'#00e87a', borderColor:'rgba(0,232,122,0.3)' }}>
            ✉️ Email Calendar
          </button>
          <button onClick={del} className="btn btn-danger btn-sm">Delete</button>
          {client.portalEnabled && client.portalPin && (
            <Link href={`/portal/${id}`} target="_blank" className="btn btn-ghost btn-sm" style={{ color:'#ffffff', borderColor:'rgba(255,255,255,0.3)' }}>View Portal ↗</Link>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`tab-item ${tab===t?'active':''}`}>{t}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab==='Overview' && (
        <div className="animate-fadeIn" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div className="hud-card" style={{ padding:22 }}>
            <div className="label" style={{ marginBottom:14 }}>Contact Info</div>
            {editing ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[['name','Name'],['email','Email'],['phone','Phone'],['company','Company'],['status','Status']].map(([k,l])=>
                  k==='status'
                    ? <EF key={k} label={l}><select value={form[k]||''} onChange={e=>set(k,e.target.value)} className="input">
                        <option value="active">Active</option><option value="paused">Paused</option><option value="churned">Churned</option>
                      </select></EF>
                    : <EF key={k} label={l}><input value={form[k]||''} onChange={e=>set(k,e.target.value)} className="input" /></EF>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[['Email',client.email],['Phone',client.phone],['Company',client.company]].map(([k,v])=> v ? (
                  <div key={k as string} style={{ display:'flex', gap:12 }}>
                    <span style={{ fontSize:10, color:'#444', width:60, flexShrink:0, textTransform:'uppercase', letterSpacing:'0.05em', paddingTop:1 }}>{k}</span>
                    <span style={{ fontSize:13, color:'#ccc' }}>{v as string}</span>
                  </div>
                ) : null)}
              </div>
            )}
          </div>

          <div className="hud-card" style={{ padding:22 }}>
            <div className="label" style={{ marginBottom:14 }}>Social Handles</div>
            {editing ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {['instagram','tiktok','facebook','twitter','youtube'].map(p=>(
                  <EF key={p} label={p}><input value={form[p]||''} onChange={e=>set(p,e.target.value)} placeholder="@handle" className="input" /></EF>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[['Instagram',client.instagram,'#e1306c'],['TikTok',client.tiktok,'#aaa'],['Facebook',client.facebook,'#1877f2'],['Twitter/X',client.twitter,'#1d9bf0'],['YouTube',client.youtube,'#ff0000']].map(([k,v,c])=> v ? (
                  <div key={k as string} style={{ display:'flex', gap:12 }}>
                    <span style={{ fontSize:10, color:'#444', width:70, flexShrink:0, textTransform:'uppercase', letterSpacing:'0.05em', paddingTop:1 }}>{k}</span>
                    <span style={{ fontSize:13, color:c as string, fontWeight:600 }}>{v as string}</span>
                  </div>
                ) : null)}
                {!client.instagram&&!client.tiktok&&!client.facebook&&!client.twitter&&!client.youtube && <span style={{ fontSize:12, color:'#333' }}>No handles added</span>}
              </div>
            )}
          </div>

          <div className="hud-card" style={{ padding:22 }}>
            <div className="label" style={{ marginBottom:14 }}>Payment</div>
            {editing ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <EF label="Monthly Rate ($)"><input value={form.monthlyRate||''} onChange={e=>set('monthlyRate',e.target.value)} type="number" className="input" /></EF>
                <EF label="Payment Due Day (1–31)"><input value={form.paymentDueDay||''} onChange={e=>set('paymentDueDay',e.target.value)} type="number" min="1" max="31" className="input" /></EF>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:26, fontWeight:900, color:'#00ff88', letterSpacing:'-0.02em' }}>
                  {client.monthlyRate ? `$${Number(client.monthlyRate).toLocaleString()}` : '—'}
                  {client.monthlyRate && <span style={{ fontSize:12, color:'#444', fontWeight:400 }}>/month</span>}
                </div>
                {client.paymentDueDay && <div style={{ fontSize:12, color:'#555' }}>Due on the {client.paymentDueDay}{['st','nd','rd'][client.paymentDueDay-1]||'th'} of each month</div>}
              </div>
            )}
          </div>

          <div className="hud-card" style={{ padding:22 }}>
            <div className="label" style={{ marginBottom:14 }}>Portal Access</div>
            {editing ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <EF label="Portal PIN"><input value={form.portalPin||''} onChange={e=>set('portalPin',e.target.value)} placeholder="4-digit PIN" maxLength={4} className="input" /></EF>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <input type="checkbox" id="portalEnabled" checked={!!form.portalEnabled} onChange={e=>set('portalEnabled', e.target.checked as any)} />
                  <label htmlFor="portalEnabled" style={{ fontSize:12, color:'#888' }}>Enable client portal access</label>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span className={`status-dot ${client.portalEnabled ? 'active' : 'paused'}`} />
                  <span style={{ fontSize:12, color: client.portalEnabled ? '#00ff88' : '#555' }}>{client.portalEnabled ? 'Portal Enabled' : 'Portal Disabled'}</span>
                </div>
                {client.portalPin && <div style={{ fontSize:12, color:'#444' }}>PIN: <span style={{ color:'#888', fontFamily:'monospace' }}>{client.portalPin}</span></div>}
                {client.portalEnabled && <Link href={`/portal/${id}`} target="_blank" style={{ display:'inline-block', marginTop:10, fontSize:11, color:'#ffffff', textDecoration:'none' }}>Open Client View ↗</Link>}
              </div>
            )}
          </div>

          <div className="hud-card" style={{ padding:22, gridColumn:'1/-1' }}>
            <div className="label" style={{ marginBottom:12 }}>Internal Notes</div>
            {editing
              ? <textarea value={form.notes||''} onChange={e=>set('notes',e.target.value)} rows={4} className="input" style={{ resize:'vertical' }} />
              : <p style={{ fontSize:13, color:client.notes?'#888':'#333', lineHeight:1.7 }}>{client.notes||'No notes.'}</p>
            }
          </div>
        </div>
      )}

      {tab==='Contracts'   && <ContractsTab  client={client} onRefresh={load} />}
      {tab==='To-Do'       && <DeliverablesTab client={client} onRefresh={load} />}
      {tab==='Social Calendar' && <ContentTab  client={client} onRefresh={load} />}
      {tab==='Email'           && <EmailTab    client={client} onRefresh={load} />}
      {tab==='Analytics'       && <AnalyticsTab client={client} onRefresh={load} />}
      {tab==='Notes'       && <NotesTab      client={client} onRefresh={load} />}
    </div>
  )
}

function EF({ label, children }:{ label:string; children:React.ReactNode }) {
  return <div><label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:4, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>{children}</div>
}
