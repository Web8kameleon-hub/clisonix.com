import { NextResponse } from 'next/server';

const API_INTERNAL = process.env.API_INTERNAL_URL || "http://clisonix-api:8000";

export async function GET() {
  try {
    const response = await fetch(`${API_INTERNAL}/api/reporting/export-pptx`, {
      method: 'GET',
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to generate PowerPoint', status: response.status },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="clisonix-report.pptx"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export to PowerPoint', details: String(error) },
      { status: 503 }
    );
  }
}
