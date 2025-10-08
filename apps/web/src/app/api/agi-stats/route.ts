import { NextRequest, NextResponse } from 'next/server'

// REAL API endpoints - no mock data
const ASI_BACKEND = 'http://localhost:8000';
const SIGNAL_GEN_BACKEND = 'http://localhost:8088';

export async function GET() {
  try {
    // Fetch real data from both active backends
    const [asiResponse, signalGenResponse] = await Promise.allSettled([
      fetch(`${ASI_BACKEND}/asi/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000)
      }),
      fetch(`${SIGNAL_GEN_BACKEND}/status`, {
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000)
      })
    ]);

    const stats = {
      timestamp: new Date().toISOString(),
      asi_system: {
        status: 'unknown',
        trinity: { alba: 'unknown', albi: 'unknown', jona: 'unknown' }
      },
      signal_gen: {
        status: 'unknown',
        uptime: 0,
        memory_usage: 0
      }
    };

    // Extract real ASI data
    if (asiResponse.status === 'fulfilled' && asiResponse.value.ok) {
      const asiData = await asiResponse.value.json();
      stats.asi_system = {
        status: asiData.status || 'unknown',
        trinity: {
          alba: asiData.trinity?.alba?.status || 'unknown',
          albi: asiData.trinity?.albi?.status || 'unknown', 
          jona: asiData.trinity?.jona?.status || 'unknown'
        }
      };
    }

    // Extract real Signal Gen data  
    if (signalGenResponse.status === 'fulfilled' && signalGenResponse.value.ok) {
      const signalData = await signalGenResponse.value.json();
      stats.signal_gen = {
        status: signalData.status || 'unknown',
        uptime: signalData.uptime || 0,
        memory_usage: signalData.memory?.used || 0
      };
    }
    
    return NextResponse.json(stats, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error fetching real system stats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch system stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}