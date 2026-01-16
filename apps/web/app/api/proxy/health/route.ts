import { NextResponse } from 'next/server';

// Internal API URL - bypasses Cloudflare
const API_INTERNAL = "http://127.0.0.1:8000";

export async function GET() {
  try {
    const response = await fetch(`${API_INTERNAL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Main API', details: String(error) },
      { status: 503 }
    );
  }
}
