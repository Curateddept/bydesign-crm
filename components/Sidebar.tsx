'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV = [
  { label: 'Command Center', href: '/', icon: '◈' },
  { label: 'Clients', href: '/clients', icon: '◉' },
  { label: 'To Do', href: '/todos', icon: '◎' },
  { label: 'Content Planner', href: '/calendar', icon: '▦' },
  { label: 'Analytics', href: '/analytics', icon: '◬' },
  { label: 'Client Portal', href: '/portal', icon: '⊡' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [inboxCount,   setInboxCount]   = useState(0)
  const [gcalConnected, setGcalConnected] = useState<boolean|null>(null)

  useEffect(() => {
    fetch('/api/auth/google-calendar/status')
      .then(r => r.ok ? r.json() : { connected: false })
      .then(d => setGcalConnected(d.connected))
      .catch(() => setGcalConnected(false))
  }, [])

  // Poll for unread client messages every 30s
  useEffect(() => {
    const load = () => {
      fetch('/api/notes?type=client_inbox')
        .then(r => r.ok ? r.json() : [])
        .then(data => {
          const unread = Array.isArray(data)
            ? data.filter((n: any) =>
                (n.type === 'client_idea' || n.content?.startsWith('[CLIENT FEEDBACK]')) &&
                n.status === 'open'
              ).length
            : 0
          setInboxCount(unread)
        })
        .catch(() => {})
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside style={{
      width: 230, minHeight: '100vh', background: '#090d17',
      borderRight: '1px solid #1a2335',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 22px', borderBottom: '1px solid #1a2335' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 28, height: 28, background: '#ffffff',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              ByDesign
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#ffffff', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 1 }}>
              CRM
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="live-badge">Live</span>
          <span style={{ fontSize: 10, color: '#444' }}>Digital Marketing OS</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 0' }}>
        {NAV.map((item, i) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const isClients = item.href === '/clients'
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 20px',
              fontSize: 11, fontWeight: active ? 700 : 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: active ? '#ffffff' : '#555',
              background: active ? 'rgba(99,130,255,0.1)' : 'transparent',
              borderLeft: `2px solid ${active ? '#e8eeff' : 'transparent'}`,
              textDecoration: 'none',
              transition: 'all 0.15s',
              animationDelay: `${i * 0.05}s`,
            }}>
              <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {/* Inbox badge on Clients nav item */}
              {isClients && inboxCount > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 800, color: '#fff',
                  background: '#ff3366', borderRadius: 10,
                  padding: '1px 6px', lineHeight: 1.6, flexShrink: 0,
                }}>
                  {inboxCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Client inbox quick summary */}
      {inboxCount > 0 && (
        <div style={{ margin: '0 12px 12px', padding: '10px 12px', background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.15)', borderRadius: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#ff6688', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
            📥 Client Inbox
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>
            {inboxCount} unread message{inboxCount !== 1 ? 's' : ''} — check client Notes tabs
          </div>
        </div>
      )}

      {/* Google Calendar connect */}
      {gcalConnected !== null && (
        <div style={{ margin: '0 12px 10px', padding: '10px 12px', background: gcalConnected ? 'rgba(0,232,122,0.04)' : 'rgba(255,255,255,0.03)', border: `1px solid ${gcalConnected ? 'rgba(0,232,122,0.15)' : '#1a2335'}`, borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 12 }}>📅</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: gcalConnected ? '#00e87a' : '#555', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Google Calendar
            </span>
            {gcalConnected && <span style={{ fontSize: 9, color: '#00e87a', marginLeft: 'auto' }}>● Connected</span>}
          </div>
          {gcalConnected ? (
            <div style={{ fontSize: 10, color: '#3d4f6e', lineHeight: 1.5 }}>
              To-Dos auto-sync to your calendar
            </div>
          ) : (
            <a href="/api/auth/google-calendar" style={{ display: 'block', marginTop: 4, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #1a2335', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#8a99b8', textDecoration: 'none', textAlign: 'center', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Connect →
            </a>
          )}
        </div>
      )}

      {/* Add Client CTA */}
      <div style={{ padding: '16px 16px 20px', borderTop: '1px solid #1a2335' }}>
        <Link href="/clients/new" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 11, letterSpacing: '0.08em' }}>
          + NEW CLIENT
        </Link>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 10, color: '#333', letterSpacing: '0.05em' }}>
          BYDESIGN © {new Date().getFullYear()}
        </div>
      </div>
    </aside>
  )
}
