import { NextResponse } from 'next/server';

const API_INTERNAL = process.env.NODE_ENV === 'production' ? "http://clisonix-core:8000" : "http://127.0.0.1:8000";

export async function GET() {
  try {
    const response = await fetch(`${API_INTERNAL}/api/reporting/export-excel`, {
      method: 'GET',
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to generate Excel', status: response.status },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="clisonix-report.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export to Excel', details: String(error) },
      { status: 503 }
    );
  }
}
