import { NextResponse } from 'next/server'

// PRODUCTION: Hetzner server IP / clisonix.com
// Port 8001 = reporting microservice
const HETZNER_API = 'http://46.224.205.183:8001'
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || process.env.API_INTERNAL_URL || HETZNER_API).replace(/\/$/, '')

export async function GET() {
  try {
    const upstream = await fetch(`${API_BASE}/status`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      const body = await upstream.text()
      throw new Error(`Upstream ${API_BASE}/status responded ${upstream.status}: ${body}`)
    }

    const payload = await upstream.json()
    return NextResponse.json({ success: true, data: payload })
  } catch (error: unknown) {
    console.error('[system-status] using fallback payload:', error)
    const fallback = {
      core_services: 'Degraded',
      network: 'Disconnected',
      maintenance: 'Offline',
      data_integrity: 'Unverified',
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json({ success: false, data: fallback }, { status: 200 })
  }
}
