import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_API_URL = process.env.LINKEDIN_API_URL || 'http://localhost:8007';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${LINKEDIN_API_URL}/api/linkedin/post-daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error triggering daily post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger daily post' },
      { status: 500 }
    );
  }
}
