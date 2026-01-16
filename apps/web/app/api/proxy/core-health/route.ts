import { NextResponse } from 'next/server';

// Core Service URL - use Docker container name in production
const CORE_API = process.env.NODE_ENV === 'production' ? "http://clisonix-core:8000" : "http://127.0.0.1:8002";

export async function GET() {
  try {
    const response = await fetch(`${CORE_API}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Core Service', details: String(error) },
      { status: 503 }
    );
  }
}
