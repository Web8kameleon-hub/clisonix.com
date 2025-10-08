/**
 * ASI Status API Route
 * ====================
 * 
 * Returns status of ASI Trinity architecture (Alba, Albi, Jona)
 */

import { NextRequest, NextResponse } from 'next/server';

// ASI Backend URL - connects to main Python API
const ASI_BACKEND_URL = process.env.ASI_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Duke kontrolluar statusin e ASI në:', `${ASI_BACKEND_URL}/asi/status`);
    
    // Timeout për të shmangur pritjet e pafundme
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${ASI_BACKEND_URL}/asi/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ASI status endpoint responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      asi_status: data,
      trinity_health: {
        alba: data.alba?.status || 'unknown',
        albi: data.albi?.consciousness || 'unknown', 
        jona: data.jona?.protection || 'unknown'
      },
      timestamp: new Date().toISOString(),
      source: 'neurosonix-asi-backend'
    });

  } catch (error: any) {
    console.error('❌ Gabim në lidhjen me ASI backend:', error);
    
    return NextResponse.json({
      success: false,
      error: 'ASI backend connection failed',
      message: error.message,
      fallback_data: {
        asi_status: 'offline',
        trinity_health: {
          alba: 'disconnected',
          albi: 'sleeping',
          jona: 'disabled'
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}