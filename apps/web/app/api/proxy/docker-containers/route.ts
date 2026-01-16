import { NextResponse } from 'next/server'

// Use Docker container name in clisonix-secure network
const EXCEL_CORE_URL = process.env.NODE_ENV === 'production' ? 'http://clisonix-excel-core:8010' : 'http://127.0.0.1:8010';

export async function GET() {
  try {
    const response = await fetch(`${EXCEL_CORE_URL}/api/reporting/docker-containers`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      return NextResponse.json({ containers: [], total: 0, running: 0 }, { status: 200 })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Docker containers fetch error:', error)
    return NextResponse.json({ containers: [], total: 0, running: 0 }, { status: 200 })
  }
}
