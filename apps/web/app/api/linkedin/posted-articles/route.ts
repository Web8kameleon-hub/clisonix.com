import { NextResponse } from 'next/server';

const LINKEDIN_API_URL = process.env.LINKEDIN_API_URL || 'http://localhost:8007';

export async function GET() {
  try {
    const response = await fetch(`${LINKEDIN_API_URL}/api/linkedin/posted-articles`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching posted articles:', error);
    return NextResponse.json({ posted: [], count: 0 });
  }
}
