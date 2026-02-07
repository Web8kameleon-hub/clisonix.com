import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_API_URL = process.env.LINKEDIN_API_URL || 'http://localhost:8007';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${LINKEDIN_API_URL}/api/linkedin/post-custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error posting custom content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to post custom content' },
      { status: 500 }
    );
  }
}
