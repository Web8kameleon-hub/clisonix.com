/**
 * Signal-Gen Backend Proxy Routes
 * Connects to existing TypeScript Fastify server on port 3001
 */

import { NextRequest, NextResponse } from 'next/server'

// Signal-Gen TypeScript Backend URL
const SIGNAL_GEN_BACKEND = 'http://localhost:8088'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${SIGNAL_GEN_BACKEND}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Signal-Gen backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data,
      source: 'signal-gen-backend',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Signal-Gen backend health check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Signal-Gen backend unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
      fallback_data: {
        service: 'neurosonix-signal-gen-backend',
        status: 'offline',
        version: '1.0.0',
        industrial_grade: true,
        real_data_only: true
      }
    }, { status: 503 })
  }
}