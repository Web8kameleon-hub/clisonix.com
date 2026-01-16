import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://127.0.0.1:8010/api/reporting/system-metrics', {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      return NextResponse.json({ cpu_percent: 0, memory_percent: 0, disk_percent: 0 }, { status: 200 })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('System metrics fetch error:', error)
    return NextResponse.json({ cpu_percent: 0, memory_percent: 0, disk_percent: 0 }, { status: 200 })
  }
}
