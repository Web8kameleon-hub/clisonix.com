import { NextResponse } from 'next/server';

// Core Service URL - use main API container
const CORE_API = process.env.API_INTERNAL_URL || "http://clisonix-api:8000";

export async function GET() {
  try {
    const response = await fetch(`${CORE_API}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'API returned non-200 status', status: response.status },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Core Service', details: String(error) },
      { status: 503 }
    );
  }
}
