import { NextResponse } from 'next/server'

/**
 * CURIOSITY OCEAN API - Hybrid AI Proxy
 * Proxies to backend /api/ai/curiosity-ocean endpoint
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://46.224.205.183:8000'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const question = body.question
    const curiosity_level = body.curiosity_level

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const mode = curiosity_level || 'curious'
    const backendUrl = `${BACKEND_API_URL}/api/ai/curiosity-ocean?question=${encodeURIComponent(question)}&mode=${mode}`
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        ocean_response: data.response?.answer || '🌊 Processing...',
        rabbit_holes: ['Explore deeper', 'Related concepts', 'Advanced topics'],
        next_questions: ['What else interests you?', 'How does this connect?'],
        mode: mode
      })
    }

    // Fallback
    return NextResponse.json({
      ocean_response: '🌊 Every question opens new doors to understanding.',
      rabbit_holes: ['The nature of curiosity', 'How knowledge grows'],
      next_questions: ['What else intrigues you?', 'Where does this lead?']
    })

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown'
    return NextResponse.json({
      ocean_response: '🌊 Connecting to knowledge...',
      rabbit_holes: [],
      next_questions: [],
      error: errMsg
    })
  }
}
