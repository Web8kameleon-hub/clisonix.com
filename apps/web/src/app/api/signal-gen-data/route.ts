/**
 * Real-Time Data Proxy Routes  
 * Connect to REAL Signal-Gen backend - NO MOCK DATA
 */

import { NextRequest, NextResponse } from 'next/server'

// REAL Signal-Gen backend running on port 8088
const SIGNAL_GEN_BACKEND = 'http://localhost:8088'

export async function GET(request: NextRequest) {
  try {
    // Extract the API path from the request
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'status'
    
    // Available real endpoints: status, health, ecosystem-status
    const validEndpoints = ['status', 'health', 'ecosystem-status'];
    const actualEndpoint = validEndpoints.includes(endpoint) ? endpoint : 'status';
    
    const response = await fetch(`${SIGNAL_GEN_BACKEND}/${actualEndpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Signal-Gen API endpoint ${actualEndpoint} responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      endpoint: actualEndpoint,
      data,
      source: 'neurosonix-signal-gen-backend',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Signal-Gen API proxy failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Signal-Gen API proxy failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'process-eeg'
    
    const requestBody = await request.json()
    
    const response = await fetch(`${SIGNAL_GEN_BACKEND}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Signal-Gen API POST to ${endpoint} failed with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      endpoint,
      data,
      source: 'signal-gen-typescript-backend',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Signal-Gen API POST proxy failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Signal-Gen API POST proxy failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}