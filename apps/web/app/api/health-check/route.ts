import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ServiceHealth {
  name: string
  status: 'operational' | 'degraded' | 'outage'
  latency: number
  port: number
}

async function checkService(name: string, port: number, path = '/health'): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000)
    })
    const latency = Date.now() - start
    if (res.ok) {
      return { name, status: 'operational', latency, port }
    }
    return { name, status: 'degraded', latency, port }
  } catch {
    return { name, status: 'outage', latency: Date.now() - start, port }
  }
}

export async function GET() {
  const checks = await Promise.all([
    checkService('Main API', 8000, '/health'),
    checkService('Excel Service', 8002, '/health'),
    checkService('Core Service', 8003, '/health'),
    checkService('Frontend', 3000, '/api/ping'),
  ])

  const operational = checks.filter(s => s.status === 'operational').length
  const overall = operational === checks.length ? 'ALL_OPERATIONAL'
    : operational > checks.length / 2 ? 'PARTIAL_OUTAGE' : 'MAJOR_OUTAGE'

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overall,
    operational_count: operational,
    total_services: checks.length,
    services: checks
  }, {
    headers: { 'Cache-Control': 'no-cache, no-store' }
  })
}
