import { NextResponse } from 'next/server';

// Core Service URL (same as Excel for now)
const CORE_API = "http://127.0.0.1:8002";

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
