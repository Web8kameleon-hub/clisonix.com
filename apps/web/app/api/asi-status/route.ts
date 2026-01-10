import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const upstream = await fetch(`http://api:8000/asi/status`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      throw new Error(`Upstream responded with ${upstream.status}`)
    }

    const payload = await upstream.json()
    return NextResponse.json({ success: true, asi_status: payload.trinity ? payload : { trinity: payload } })
  } catch (error) {
    console.error('[asi-status] fallback engaged:', error)
    const fallback = {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      trinity: {
        alba: { status: 'unknown', role: 'network_monitor', health: 0 },
        albi: { status: 'unknown', role: 'neural_processor', health: 0 },
        jona: { status: 'unknown', role: 'data_coordinator', health: 0 },
      },
      system: {
        version: 'unavailable',
        uptime: 0,
        instance: 'local-fallback',
      },
    }
    return NextResponse.json({ success: false, asi_status: fallback }, { status: 200 })
  }
}
