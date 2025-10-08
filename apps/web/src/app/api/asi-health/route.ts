/**
 * ASI Health Check API Route
 * ===========================
 * 
 * Health check for ASI Trinity system components
 */

import { NextRequest, NextResponse } from 'next/server';

// ASI Backend URL
const ASI_BACKEND_URL = process.env.ASI_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${ASI_BACKEND_URL}/asi/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`ASI health endpoint responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      health: data,
      asi_operational: true,
      components_status: {
        alba_network: data.alba?.operational || false,
        albi_intelligence: data.albi?.ready || false,
        jona_safety: data.jona?.active || false
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('ASI health check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'ASI health check failed',
      message: error.message,
      fallback_health: {
        asi_operational: false,
        components_status: {
          alba_network: false,
          albi_intelligence: false,
          jona_safety: false
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}