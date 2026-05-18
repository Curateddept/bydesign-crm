'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUS_OPTS = ['pending', 'in_progress', 'done', 'approved']
const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706' },
  in_progress: { bg: '#ede9fe', text: '#7c3aed' },
  done: { bg: '#f0fdf4', text: '#16a34a' },
  approved: { bg: '#f0fdf4', text: '#16a34a' },
}

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterClient, setFilterClient] = useState('all')

  const load = () => {
    Promise.all([
      fetch('/api/deliverables').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ]).then(([d, c]) => {
      setDeliverables(Array.isArray(d) ? d : [])
      setClients(Array.isArray(c) ? c : [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/deliverables/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  const filtered = deliverables.filter(d => {
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    const matchClient = filterClient === 'all' || d.clientId === filterClient
    return matchStatus && matchClient
  })

  const overdue = filtered.filter(d => d.dueDate && new Date(d.dueDate) < new Date() && d.status !== 'done' && d.status !== 'approved')
  const upcoming = filtered.filter(d => !d.dueDate || new Date(d.dueDate) >= new Date() || d.status === 'done' || d.status === 'approved')

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading...</div>

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>All Deliverables</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{deliverables.length} total across all clients</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', outline: 'none' }}>
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {['all', ...STATUS_OPTS].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13,
            background: filterStatus === s ? '#6366f1' : '#fff', color: filterStatus === s ? '#fff' : '#6b7280',
            cursor: 'pointer', fontWeight: filterStatus === s ? 600 : 400, textTransform: 'capitalize'
          }}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      {overdue.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Overdue ({overdue.length})
          </div>
          <DeliverableList items={overdue} onStatusChange={updateStatus} />
        </div>
      )}

      <div>
        {overdue.length > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Remaining ({upcoming.length})
        </div>}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 13, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            No deliverables. Add them from the client page.
          </div>
        ) : (
          <DeliverableList items={upcoming} onStatusChange={updateStatus} />
        )}
      </div>
    </div>
  )
}

function DeliverableList({ items, onStatusChange }: { items: any[]; onStatusChange: (id: string, status: string) => void }) {
  if (items.length === 0) return null
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {items.map((d, i) => (
        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
          <select value={d.status} onChange={e => onStatusChange(d.id, e.target.value)} style={{
            padding: '4px 8px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: STATUS_STYLE[d.status]?.bg || '#f3f4f6',
            color: STATUS_STYLE[d.status]?.text || '#6b7280',
            minWidth: 90,
          }}>
            {['pending', 'in_progress', 'done', 'approved'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{d.title}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
              {[d.type, d.platform, d.dueDate ? `Due ${new Date(d.dueDate).toLocaleDateString()}` : null].filter(Boolean).join(' · ')}
            </div>
          </div>

          <Link href={`/clients/${d.clientId}`} style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none', whiteSpace: 'nowrap', padding: '5px 10px', background: '#f9fafb', borderRadius: 6 }}>
            {d.client?.name}
          </Link>
        </div>
      ))}
    </div>
  )
}
