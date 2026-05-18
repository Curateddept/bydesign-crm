'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortal = pathname.startsWith('/portal')

  if (isPortal) {
    // Portal pages get a clean layout — no sidebar, no admin nav
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <main style={{
        marginLeft: 230,
        flex: 1,
        minHeight: '100vh',
        padding: '32px 36px',
        maxWidth: 'calc(100vw - 230px)'
      }}>
        {children}
      </main>
    </>
  )
}
