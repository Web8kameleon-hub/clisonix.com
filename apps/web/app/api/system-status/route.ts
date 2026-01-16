import { NextResponse } from 'next/server'

// SERVER-TO-SERVER: Use Docker container name in production
// clisonix-core:8000 = Main API container (internal port)
const API_INTERNAL = 'http://clisonix-core:8000'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const upstream = await fetch(`${API_INTERNAL}/status`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      const body = await upstream.text()
      throw new Error(`Upstream responded ${upstream.status}: ${body}`)
    }

    const payload = await upstream.json()
    return NextResponse.json({ success: true, data: payload }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error: unknown) {
    console.error('[system-status] error:', error)
    const fallback = {
      timestamp: new Date().toISOString(),
      instance_id: 'fallback',
      status: 'error',
      uptime: 'N/A',
      memory: { used: 0, total: 0 },
      system: {
        cpu_percent: 0,
        memory_percent: 0,
        disk_percent: 0,
        hostname: 'unknown'
      }
    }
    return NextResponse.json({ success: false, data: fallback }, { status: 200 })
  }
}
