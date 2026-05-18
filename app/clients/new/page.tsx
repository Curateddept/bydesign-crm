'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:'', email:'', phone:'', company:'', status:'active',
    instagram:'', tiktok:'', facebook:'', twitter:'', youtube:'',
    monthlyRate:'', paymentDueDay:'', portalPin:'', notes:'',
  })
  const set = (k:string, v:string) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    if (!form.name.trim()) return alert('Client name is required')
    setSaving(true)
    try {
      const nullify = (v: string) => v.trim() || null
      const payload = {
        name:          form.name.trim(),
        status:        form.status,
        email:         nullify(form.email),
        phone:         nullify(form.phone),
        company:       nullify(form.company),
        instagram:     nullify(form.instagram),
        tiktok:        nullify(form.tiktok),
        facebook:      nullify(form.facebook),
        twitter:       nullify(form.twitter),
        youtube:       nullify(form.youtube),
        notes:         nullify(form.notes),
        portalPin:     nullify(form.portalPin),
        monthlyRate:   form.monthlyRate   ? parseFloat(form.monthlyRate)   : null,
        paymentDueDay: form.paymentDueDay ? parseInt(form.paymentDueDay)   : null,
      }
      const res = await fetch('/api/clients', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const client = await res.json()
      router.push(`/clients/${client.id}`)
    } catch (err) {
      setSaving(false)
      alert('Failed to create client. Please try again.')
      console.error(err)
    }
  }

  return (
    <div className="animate-fadeIn" style={{ maxWidth:660 }}>
      <Link href="/clients" style={{ fontSize:11, color:'#555', textDecoration:'none', letterSpacing:'0.05em', display:'inline-block', marginBottom:20 }}>← BACK TO CLIENTS</Link>
      <div className="label" style={{ marginBottom:6 }}>New Record</div>
      <h1 style={{ fontSize:24, fontWeight:900, color:'#fff', letterSpacing:'-0.02em', marginBottom:24 }}>Add Client</h1>

      <div className="hud-card" style={{ padding:28 }}>
        <Section title="Client Info">
          <F label="Client Name *"><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Full name" className="input" /></F>
          <Row>
            <F label="Email"><input value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@domain.com" className="input" /></F>
            <F label="Phone"><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="(555) 000-0000" className="input" /></F>
          </Row>
          <Row>
            <F label="Brand / Company"><input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Brand name" className="input" /></F>
            <F label="Status">
              <select value={form.status} onChange={e=>set('status',e.target.value)} className="input">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="churned">Churned</option>
              </select>
            </F>
          </Row>
        </Section>

        <Section title="Payment">
          <Row>
            <F label="Monthly Rate ($)"><input value={form.monthlyRate} onChange={e=>set('monthlyRate',e.target.value)} type="number" placeholder="0.00" className="input" /></F>
            <F label="Payment Due Day (1–31)"><input value={form.paymentDueDay} onChange={e=>set('paymentDueDay',e.target.value)} type="number" min="1" max="31" placeholder="1" className="input" /></F>
          </Row>
        </Section>

        <Section title="Social Handles">
          <Row>
            <F label="Instagram"><input value={form.instagram} onChange={e=>set('instagram',e.target.value)} placeholder="@handle" className="input" /></F>
            <F label="TikTok"><input value={form.tiktok} onChange={e=>set('tiktok',e.target.value)} placeholder="@handle" className="input" /></F>
          </Row>
          <Row>
            <F label="Facebook"><input value={form.facebook} onChange={e=>set('facebook',e.target.value)} placeholder="Page name" className="input" /></F>
            <F label="Twitter / X"><input value={form.twitter} onChange={e=>set('twitter',e.target.value)} placeholder="@handle" className="input" /></F>
          </Row>
          <F label="YouTube"><input value={form.youtube} onChange={e=>set('youtube',e.target.value)} placeholder="Channel name" className="input" /></F>
        </Section>

        <Section title="Client Portal">
          <F label="Portal PIN (4-digit code client uses to log in)">
            <input value={form.portalPin} onChange={e=>set('portalPin',e.target.value)} placeholder="e.g. 4829" maxLength={4} className="input" style={{ maxWidth:160 }} />
          </F>
          <p style={{ fontSize:11, color:'#444', marginTop:6 }}>Client uses their name + this PIN to access their portal</p>
        </Section>

        <Section title="Internal Notes">
          <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Internal notes about this client..." rows={3} className="input" style={{ resize:'vertical' }} />
        </Section>

        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'CREATE CLIENT'}</button>
          <Link href="/clients" className="btn btn-ghost">Cancel</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div className="label" style={{ marginBottom:12 }}>{title}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{children}</div>
    </div>
  )
}
function Row({ children }:{ children:React.ReactNode }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>{children}</div>
}
function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return <div><label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>{children}</div>
}
