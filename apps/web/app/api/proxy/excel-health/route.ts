import { NextResponse } from 'next/server';

// Excel Service URL
const EXCEL_API = "http://127.0.0.1:8002";

export async function GET() {
  try {
    const response = await fetch(`${EXCEL_API}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Excel Service', details: String(error) },
      { status: 503 }
    );
  }
}
