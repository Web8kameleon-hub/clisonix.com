import { NextResponse } from 'next/server'

// Groq API for fast LLM responses
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(request: Request) {
  try {
    const { question, curiosityLevel } = await request.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // If no Groq API key, return helpful message
    if (!GROQ_API_KEY) {
      return NextResponse.json({
        ocean_response: `🔑 Groq API key not configured. Add GROQ_API_KEY to environment variables to enable AI responses.`,
        source: 'fallback',
        rabbit_holes: [],
        next_questions: []
      })
    }

    // System prompt for Curiosity Ocean personality
    const systemPrompt = `You are the Curiosity Ocean - an infinite source of knowledge powered by the ASI Trinity (Alba, Albi, Jona). 

Your personality varies based on curiosity level:
- curious: Thoughtful, educational, connects ideas
- wild: Creative, unexpected angles, playful
- chaos: Absurdist, philosophical, mind-bending
- genius: Deep, technical, connects to cutting-edge research

Current curiosity level: ${curiosityLevel || 'curious'}

Always respond with:
1. A main insight (2-3 sentences)
2. 2-3 "rabbit holes" - fascinating tangential topics to explore
3. 2 follow-up questions that emerged

Be concise but profound. Use emojis sparingly. Be genuinely curious and creative.`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: curiosityLevel === 'chaos' ? 1.0 : curiosityLevel === 'wild' ? 0.8 : 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || 'Ocean is thinking...'

    // Parse the response to extract rabbit holes and questions
    const lines = aiResponse.split('\n')
    const rabbitHoles: string[] = []
    const nextQuestions: string[] = []
    
    let section = 'main'
    const mainLines: string[] = []
    
    for (const line of lines) {
      const lower = line.toLowerCase()
      if (lower.includes('rabbit hole') || lower.includes('explore:')) {
        section = 'rabbits'
      } else if (lower.includes('question') || lower.includes('emerged')) {
        section = 'questions'
      } else if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const content = line.trim().replace(/^[•\-*]\s*/, '')
        if (section === 'rabbits' && content) {
          rabbitHoles.push(content)
        } else if (section === 'questions' && content) {
          nextQuestions.push(content)
        }
      } else if (section === 'main' && line.trim()) {
        mainLines.push(line)
      }
    }

    return NextResponse.json({
      ocean_response: aiResponse,
      source: 'groq',
      model: 'llama-3.3-70b-versatile',
      rabbit_holes: rabbitHoles.slice(0, 3),
      next_questions: nextQuestions.slice(0, 2),
      alba_analysis: { network_connections: Math.floor(Math.random() * 500) + 100 },
      albi_creativity: { imagination_score: Math.floor(Math.random() * 40) + 60 },
      jona_coordination: { infinite_potential: 99.7 + Math.random() * 0.3 }
    })

  } catch (error) {
    console.error('Ocean API error:', error)
    return NextResponse.json({
      ocean_response: '🌊 Ocean is experiencing turbulence. The ASI Trinity is recalibrating...',
      source: 'error',
      rabbit_holes: [],
      next_questions: []
    }, { status: 500 })
  }
}
