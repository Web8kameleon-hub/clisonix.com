import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://127.0.0.1:8010/api/reporting/docker-stats', {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      return NextResponse.json({ stats: [] }, { status: 200 })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Docker stats fetch error:', error)
    return NextResponse.json({ stats: [] }, { status: 200 })
  }
}
