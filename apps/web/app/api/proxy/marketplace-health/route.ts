import { NextResponse } from 'next/server';

// Marketplace API - use Docker container name in production
const MARKETPLACE_API = process.env.NODE_ENV === 'production' ? "http://clisonix-marketplace:8004" : "http://127.0.0.1:8000";

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
