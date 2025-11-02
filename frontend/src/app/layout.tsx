// Clisonix Industrial Cloud Global Layout
// Author: Ledjan Ahmati

import React, { useEffect, useState } from 'react'

interface GlobalStatus {
  systemUptime: string
  activeUsers: number
  lastGlobalAudit: string
  complianceStatus: string
  tracingId: string
}

interface GlobalUser {
  username: string
  role: string
  lastLogin: string
  status: string
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GlobalUser | null>(null)
  const [status, setStatus] = useState<GlobalStatus | null>(null)
  const [globalLog, setGlobalLog] = useState<Array<{ event: string; time: string }>>([])

  useEffect(() => {
    setUser({
      username: 'cloud_admin',
      role: 'Superuser',
      lastLogin: new Date(Date.now() - 7200 * 1000).toLocaleString(),
      status: 'Active'
    })
    setStatus({
      systemUptime: '120h 42m',
      activeUsers: 12,
      lastGlobalAudit: new Date(Date.now() - 1800 * 1000).toLocaleString(),
      complianceStatus: 'Compliant',
      tracingId: Math.floor(Math.random() * 1e9).toString(16)
    })
    setGlobalLog([
      { event: 'Global login', time: new Date(Date.now() - 7200 * 1000).toLocaleTimeString() },
      { event: 'Global audit', time: new Date(Date.now() - 1800 * 1000).toLocaleTimeString() },
      { event: 'System update', time: new Date(Date.now() - 600 * 1000).toLocaleTimeString() }
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <header className="bg-gray-900 text-white py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">Clisonix Industrial Cloud</div>
          <span className="ml-2 px-2 py-1 bg-green-700 rounded text-xs">Global Industrial</span>
          <span className="ml-2 px-2 py-1 bg-blue-700 rounded text-xs">Compliance: {status?.complianceStatus ?? '-'}</span>
          <span className="ml-2 px-2 py-1 bg-yellow-700 rounded text-xs">Tracing: {status?.tracingId ?? '-'}</span>
        </div>
        <nav className="space-x-6">
          <a href="/modules" className="hover:underline">Modules</a>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href="/api" className="hover:underline">API</a>
          <a href="/settings" className="hover:underline">Settings</a>
        </nav>
        <div className="flex flex-col items-end text-xs text-muted-foreground">
          <div>User: {user?.username ?? '-'}</div>
          <div>Role: {user?.role ?? '-'}</div>
          <div>Status: {user?.status ?? '-'}</div>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <div className="mb-4 flex gap-8">
          <div className="bg-gray-100 p-4 rounded shadow text-xs">
            <div className="font-semibold mb-2">Global System Status</div>
            <div>Uptime: {status?.systemUptime ?? '-'}</div>
            <div>Active Users: {status?.activeUsers ?? '-'}</div>
            <div>Last Global Audit: {status?.lastGlobalAudit ?? '-'}</div>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow text-xs">
            <div className="font-semibold mb-2">Security & Protection</div>
            <div>All systems protected, monitored, and traced.</div>
            <div>Global audit logs and compliance enabled.</div>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow text-xs">
            <div className="font-semibold mb-2">Global Log</div>
            <ul>
              {globalLog.map((h, i) => (
                <li key={i}>{h.event} - {h.time}</li>
              ))}
            </ul>
          </div>
        </div>
        {children}
      </main>
      <footer className="bg-gray-900 text-white py-4 px-8 text-xs text-center mt-8">
        <div className="mb-2">Â© 2025 Clisonix Industrial Cloud. All systems are protected, audited, and monitored for global industrial compliance.</div>
        <div className="mb-2">Log | Audit | Metrika | Compliance | Tracing | Historik | Protection</div>
        <div className="mb-2">User: {user?.username ?? '-'} | Last Login: {user?.lastLogin ?? '-'}</div>
        <div className="mb-2">Tracing ID: {status?.tracingId ?? '-'}</div>
      </footer>
    </div>
  )
}
