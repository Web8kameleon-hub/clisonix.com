/**
 * ASI Command Execution API Route
 * ================================
 * 
 * Executes commands through ASI Trinity system
 */

import { NextRequest, NextResponse } from 'next/server';

const ASI_BACKEND_URL = process.env.ASI_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, agent } = body;

    if (!command) {
      return NextResponse.json({
        success: false,
        error: 'Command is required'
      }, { status: 400 });
    }

    console.log(`🚀 Executing ASI command: "${command}" via ${agent || 'Trinity'}`);

    const response = await fetch(`${ASI_BACKEND_URL}/asi/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command,
        agent: agent || 'alba', // Default to Alba
        timestamp: new Date().toISOString()
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`ASI execution failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      execution_result: data,
      command_processed: command,
      agent_used: agent || 'alba',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ ASI command execution failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'ASI command execution failed',
      message: error.message,
      fallback_response: {
        status: 'failed',
        message: 'ASI backend unavailable - falling back to local processing'
      },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}