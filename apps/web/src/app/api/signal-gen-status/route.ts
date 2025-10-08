// apps/web/src/app/api/signal-gen-status/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Use the correct backend URL - match with your running backend
const BACKEND_URL = process.env.SIGNAL_GEN_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Duke kontrolluar statusin e backend në:', `${BACKEND_URL}/status`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      status: 'connected',
      signal_gen_status: data,
      trio_integration: {
        albi: data.neurosonix_ecosystem?.albi || 'active',
        alba: data.neurosonix_ecosystem?.alba || 'collecting', 
        jona: data.neurosonix_ecosystem?.jona || 'monitoring'
      },
      backend_type: 'neurosonix-industrial',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Gabim në lidhjen me backend:', error);
    
    // Return fallback data instead of error to prevent frontend crashes
    return NextResponse.json({
      success: false,
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback_data: {
        trio_integration: {
          albi: 'offline',
          alba: 'offline',
          jona: 'offline'
        },
        backend_status: 'disconnected',
        message: 'Using fallback data - backend unavailable'
      },
      backend_url: BACKEND_URL,
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Return 200 instead of 503 to prevent fetch errors
  }
}