'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PortalLogin() {
  const router   = useRouter()
  const [username, setUsername] = useState('')
  const [pin,      setPin]      = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const login = async () => {
    if (!username.trim() || !pin) return setError('Enter your username and PIN')
    setLoading(true); setError('')
    const res = await fetch('/api/portal/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), pin }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
    sessionStorage.setItem('portalClient', JSON.stringify(data))
    router.push(`/portal/${data.id}`)
  }

  return (
    <div style={{ minHeight:'100vh', width:'100%', background:'#0b0f1a', display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box' }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:32, height:32, background:'#ffffff', clipPath:'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            <div>
              <div style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>ByDesign</div>
              <div style={{ fontSize:10, fontWeight:700, color:'#ffffff', letterSpacing:'0.18em', textTransform:'uppercase' }}>Client Portal</div>
            </div>
          </div>
          <p style={{ fontSize:12, color:'#444', marginTop:8 }}>Access your content calendar and analytics</p>
        </div>

        <div className="hud-card" style={{ padding:28, borderColor:'rgba(255,255,255,0.15)' }}>
          <div className="label" style={{ marginBottom:6 }}>Client Access</div>
          <h2 style={{ fontSize:18, fontWeight:800, color:'#fff', marginBottom:22 }}>Sign In</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Username */}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                Username
              </label>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
                className="input"
                style={{ fontSize:15 }}
              />
            </div>

            {/* PIN */}
            <div>
              <label style={{ fontSize:10, fontWeight:700, color:'#555', display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                PIN
              </label>
              <input
                value={pin}
                onChange={e => { setPin(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && login()}
                type="password"
                maxLength={4}
                placeholder="••••"
                autoComplete="current-password"
                className="input"
                style={{ letterSpacing:'0.3em', fontSize:22, textAlign:'center' }}
              />
            </div>

            {error && (
              <div style={{ padding:'10px 14px', background:'rgba(255,51,102,0.08)', border:'1px solid rgba(255,51,102,0.2)', borderRadius:3, fontSize:12, color:'#ff3366' }}>
                {error}
              </div>
            )}

            <button
              onClick={login}
              disabled={loading || !username.trim() || !pin}
              className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', marginTop:4, opacity: (!username.trim() || !pin) ? 0.5 : 1 }}
            >
              {loading ? 'Signing in…' : 'ACCESS PORTAL'}
            </button>
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'#333', marginTop:20 }}>
          Your username and PIN are provided by your ByDesign account manager
        </p>
      </div>
    </div>
  )
}
