'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = value
    if (end === 0) return
    const duration = 600
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <>{display.toLocaleString()}</>
}

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([])
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [content, setContent] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/deliverables').then(r => r.json()),
      fetch('/api/content').then(r => r.json()),
      fetch('/api/analytics').then(r => r.json()),
    ]).then(([c, d, ct, a]) => {
      setClients(Array.isArray(c) ? c : [])
      setDeliverables(Array.isArray(d) ? d : [])
      setContent(Array.isArray(ct) ? ct : [])
      setAnalytics(Array.isArray(a) ? a : [])
      setLoading(false)
    })
  }, [])

  const activeClients = clients.filter(c => c.status === 'active')
  const pendingTodos = deliverables.filter(d => d.status === 'pending' || d.status === 'in_progress')
  const overdue = deliverables.filter(d => d.dueDate && new Date(d.dueDate) < new Date() && !['done','approved'].includes(d.status))
  const monthlyRevenue = clients.filter(c => c.status === 'active').reduce((s, c) => s + (c.monthlyRate || 0), 0)
  const scheduledContent = content.filter(c => c.status === 'scheduled' || c.dayOfWeek)
  const totalFollowers = analytics.reduce((s, a) => s + (a.followers || 0), 0)

  // Build mini chart data from analytics
  const chartData = analytics.slice(0, 8).reverse().map((a, i) => ({
    name: `Wk${i + 1}`,
    followers: a.followers || 0,
    engagement: Math.round((a.engagementRate || 0) * 100),
    reach: Math.round((a.reach || 0) / 100),
  }))

  const STATS = [
    { label: 'Active Clients', value: activeClients.length, sub: `of ${clients.length} total`, color: '#ffffff', icon: '◉' },
    { label: 'Monthly Revenue', value: monthlyRevenue, prefix: '$', sub: 'active contracts', color: '#00ff88', icon: '◈' },
    { label: 'Open To-Dos', value: pendingTodos.length, sub: overdue.length > 0 ? `${overdue.length} overdue` : 'on track', color: overdue.length > 0 ? '#ff3366' : '#ffb800', icon: '◎' },
    { label: 'Scheduled Posts', value: scheduledContent.length, sub: 'ready to deploy', color: '#7c3aed', icon: '▦' },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, border: '2px solid #1c1c1c', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="label">Initializing...</div>
    </div>
  )

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Command Center
          </h1>
          <p style={{ color: '#555', fontSize: 12, marginTop: 6 }}>All systems operational · {activeClients.length} clients active</p>
        </div>
        <span className="live-badge">System Live</span>
      </div>

      {/* Stats Grid */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {STATS.map(stat => (
          <div key={stat.label} className="hud-card animate-fadeUp" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 18, color: stat.color }}>{stat.icon}</span>
              <span style={{ fontSize: 10, color: '#333', fontWeight: 700, letterSpacing: '0.08em' }}>{stat.label.toUpperCase()}</span>
            </div>
            <div className="stat-num" style={{ color: stat.color, marginBottom: 4 }}>
              {stat.prefix || ''}<AnimatedNumber value={stat.value} />
            </div>
            <div style={{ fontSize: 11, color: '#444' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts + Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Analytics Trend */}
        <div className="hud-card animate-fadeUp" style={{ padding: '18px 20px', gridColumn: '1 / 3' }}>
          <div className="section-header">
            <span className="section-title">Follower Growth — All Clients</span>
            <span className="live-badge">Live Data</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1c1c1c', borderRadius: 4, fontSize: 11 }}
                  labelStyle={{ color: '#888' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="followers" stroke="#ffffff" strokeWidth={2} fill="url(#colorF)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 12 }}>
              Add analytics data to see trends
            </div>
          )}
        </div>

        {/* Active Clients mini */}
        <div className="hud-card animate-fadeUp" style={{ padding: '18px 20px' }}>
          <div className="section-header">
            <span className="section-title">Clients</span>
            <Link href="/clients" style={{ fontSize: 10, color: '#ffffff', textDecoration: 'none', letterSpacing: '0.05em' }}>VIEW ALL →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeClients.slice(0, 5).map(c => (
              <Link key={c.id} href={`/clients/${c.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>{c.name}</span>
                </div>
                {c.monthlyRate && <span style={{ fontSize: 11, color: '#00ff88', fontWeight: 700 }}>${c.monthlyRate.toLocaleString()}</span>}
              </Link>
            ))}
            {activeClients.length === 0 && <div style={{ fontSize: 12, color: '#333' }}>No active clients</div>}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Open To-Dos */}
        <div className="hud-card animate-fadeUp" style={{ padding: '18px 20px' }}>
          <div className="section-header">
            <span className="section-title">Open To-Dos</span>
            <Link href="/todos" style={{ fontSize: 10, color: '#ffffff', textDecoration: 'none' }}>VIEW ALL →</Link>
          </div>
          {pendingTodos.length === 0 ? (
            <div style={{ fontSize: 12, color: '#333', padding: '20px 0', textAlign: 'center' }}>All caught up ✓</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingTodos.slice(0, 5).map(d => {
                const isOverdue = d.dueDate && new Date(d.dueDate) < new Date()
                return (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isOverdue ? '#ff3366' : d.status === 'in_progress' ? '#7c3aed' : '#ffb800' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                      <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>{d.client?.name}</div>
                    </div>
                    {isOverdue && <span className="chip chip-red" style={{ flexShrink: 0 }}>Overdue</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* This Week's Content */}
        <div className="hud-card animate-fadeUp" style={{ padding: '18px 20px' }}>
          <div className="section-header">
            <span className="section-title">Content Queue</span>
            <Link href="/calendar" style={{ fontSize: 10, color: '#ffffff', textDecoration: 'none' }}>PLANNER →</Link>
          </div>
          {scheduledContent.length === 0 ? (
            <div style={{ fontSize: 12, color: '#333', padding: '20px 0', textAlign: 'center' }}>No content scheduled</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scheduledContent.slice(0, 5).map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: '#7c3aed' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>{item.client?.name} · {item.dayOfWeek || 'Unscheduled'} {item.postTime && `@ ${item.postTime}`}</div>
                  </div>
                  <span style={{ fontSize: 10, color: '#555', textTransform: 'capitalize', flexShrink: 0 }}>{item.platform}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
