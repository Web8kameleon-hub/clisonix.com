import { NextResponse } from 'next/server';

// Marketplace API (same as Main API)
const MARKETPLACE_API = "http://127.0.0.1:8000";

export async function GET() {
  try {
    const response = await fetch(`${MARKETPLACE_API}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Marketplace', details: String(error) },
      { status: 503 }
    );
  }
}
