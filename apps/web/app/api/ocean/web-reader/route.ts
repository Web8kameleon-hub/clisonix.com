import { NextRequest, NextResponse } from 'next/server'

const OCEAN_CORE = process.env.OCEAN_API_URL || 'http://ocean-core:8030'

/**
 * Web Reader Proxy — Browse & Search the web via Ocean Core
 * 
 * GET  /api/ocean/web-reader?action=browse&url=...&max_chars=...
 * GET  /api/ocean/web-reader?action=search&q=...&num=...
 * POST /api/ocean/web-reader  { action: "chat", url: "...", message: "..." }
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'browse'

    if (action === 'search') {
      // Web search via DuckDuckGo
      const q = searchParams.get('q') || ''
      const num = searchParams.get('num') || '5'

      if (!q) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
      }

      const upstream = await fetch(
        `${OCEAN_CORE}/api/v1/search?q=${encodeURIComponent(q)}&num=${num}`,
        { headers: { Accept: 'application/json' }, cache: 'no-store' }
      )

      if (!upstream.ok) {
        throw new Error(`Ocean Core responded with ${upstream.status}`)
      }

      const data = await upstream.json()
      return NextResponse.json({ success: true, data })
    }

    // Default: browse a URL
    const url = searchParams.get('url') || ''
    const maxChars = searchParams.get('max_chars') || '8000'

    if (!url) {
      return NextResponse.json({ error: 'Query parameter "url" is required' }, { status: 400 })
    }

    const upstream = await fetch(
      `${OCEAN_CORE}/api/v1/browse?url=${encodeURIComponent(url)}&max_chars=${maxChars}`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    )

    if (!upstream.ok) {
      throw new Error(`Ocean Core responded with ${upstream.status}`)
    }

    const data = await upstream.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[web-reader] proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Ocean Core' },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, url, message, query } = body

    if (action === 'chat') {
      // Chat with webpage context
      if (!url || !message) {
        return NextResponse.json(
          { error: '"url" and "message" are required for chat action' },
          { status: 400 }
        )
      }

      const upstream = await fetch(`${OCEAN_CORE}/api/v1/chat/browse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, message }),
      })

      if (!upstream.ok) {
        throw new Error(`Ocean Core responded with ${upstream.status}`)
      }

      const data = await upstream.json()
      return NextResponse.json({ success: true, data })
    }

    if (action === 'search') {
      // Web search via POST
      const q = query || message || ''
      const upstream = await fetch(
        `${OCEAN_CORE}/api/v1/search?q=${encodeURIComponent(q)}&num=5`,
        { headers: { Accept: 'application/json' }, cache: 'no-store' }
      )

      if (!upstream.ok) {
        throw new Error(`Ocean Core responded with ${upstream.status}`)
      }

      const data = await upstream.json()
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('[web-reader] POST proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Ocean Core' },
      { status: 502 }
    )
  }
}
