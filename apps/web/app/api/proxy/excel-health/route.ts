import { NextResponse } from 'next/server';

// Excel Service URL - use Docker container name in production
const EXCEL_API = process.env.NODE_ENV === 'production' ? "http://clisonix-excel:8002" : "http://127.0.0.1:8002";

export async function GET() {
  try {
    const response = await fetch(`${EXCEL_API}/health`, {
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
      { error: 'Failed to connect to Excel Service', details: String(error) },
      { status: 503 }
    );
  }
}
