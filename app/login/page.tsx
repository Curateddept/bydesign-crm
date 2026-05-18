'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect PIN')
      setPin('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0b0f1a', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: '#131929', border: '1px solid #1e2d45', borderRadius: 16,
        padding: '48px 40px', width: 360, textAlign: 'center'
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
        <h1 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
          ByDesign CRM
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 32px' }}>
          Command Center Access
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin PIN"
            value={pin}
            onChange={e => { setPin(e.target.value); setError('') }}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: '1px solid #1e2d45', background: '#0b0f1a',
              color: '#e2e8f0', fontSize: 16, outline: 'none',
              boxSizing: 'border-box', marginBottom: 12, letterSpacing: 4,
              textAlign: 'center'
            }}
            autoFocus
          />
          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>
          )}
          <button type="submit" style={{
            width: '100%', padding: '12px', borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff', fontSize: 15, fontWeight: 600,
            border: 'none', cursor: 'pointer'
          }}>
            Access Command Center
          </button>
        </form>
      </div>
    </div>
  )
}
