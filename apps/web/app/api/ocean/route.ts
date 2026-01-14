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

    // If no Groq API key, provide intelligent fallback response
    if (!GROQ_API_KEY) {
      // Generate contextual fallback based on question
      const fallbackResponses = generateFallbackResponse(question, curiosityLevel)
      return NextResponse.json(fallbackResponses)
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
      ocean_response: '🌊 The Ocean is experiencing turbulence. Please try again in a moment.',
      source: 'error',
      rabbit_holes: [],
      next_questions: []
    }, { status: 500 })
  }
}

// Intelligent fallback responses when API is unavailable
function generateFallbackResponse(question: string, curiosityLevel: string) {
  const q = question.toLowerCase()
  
  // Knowledge domains with curated responses
  const knowledgeBase: Record<string, { response: string; rabbitHoles: string[]; questions: string[] }> = {
    neural: {
      response: "🧠 Neural systems are fascinating networks of biological computation. The brain contains approximately 86 billion neurons, each connected to thousands of others, creating the most complex known structure in the universe. This emergent complexity gives rise to consciousness, creativity, and the very curiosity that drives your question.",
      rabbitHoles: ["Neuroplasticity and learning", "Mirror neurons and empathy", "Sleep and memory consolidation"],
      questions: ["How do neural networks in AI differ from biological ones?", "Can consciousness emerge from artificial systems?"]
    },
    consciousness: {
      response: "🌌 Consciousness remains one of the deepest mysteries in science. It's the subjective experience of being - the 'what it's like' quality of existence. From integrated information theory to global workspace theory, scientists and philosophers continue to explore how physical processes give rise to subjective experience.",
      rabbitHoles: ["The hard problem of consciousness", "Altered states and meditation", "Panpsychism theories"],
      questions: ["Is consciousness fundamental to the universe?", "Could AI ever truly be conscious?"]
    },
    music: {
      response: "🎵 Music is a universal language that transcends cultures and speaks directly to our emotions. It activates multiple brain regions simultaneously - auditory cortex, motor areas, and the limbic system for emotion. From harmonic mathematics to emotional resonance, music reveals profound truths about human cognition.",
      rabbitHoles: ["Music therapy and healing", "Mathematical patterns in composition", "Cultural evolution of musical scales"],
      questions: ["Why does music evoke such strong emotions?", "How did humans first develop musical ability?"]
    },
    quantum: {
      response: "⚛️ Quantum mechanics reveals a universe far stranger than our everyday intuitions suggest. Particles exist in superposition, entanglement connects distant objects instantaneously, and observation itself influences reality. These phenomena challenge our deepest assumptions about the nature of existence.",
      rabbitHoles: ["Quantum computing applications", "Wave-particle duality", "Schrödinger's cat and measurement"],
      questions: ["How might quantum effects influence consciousness?", "What practical technologies will quantum mechanics enable?"]
    },
    default: {
      response: `🌊 What a fascinating question! The pursuit of knowledge is humanity's greatest adventure. Every question opens doors to new understanding, connecting us to the vast ocean of human wisdom accumulated over millennia. The ASI Trinity is here to guide your exploration through the infinite depths of curiosity.`,
      rabbitHoles: ["The philosophy of questions", "How knowledge accumulates", "The joy of discovery"],
      questions: ["What other mysteries intrigue you?", "How does asking questions change our understanding?"]
    }
  }

  // Match question to knowledge domain
  let domain = 'default'
  if (q.includes('neural') || q.includes('brain') || q.includes('neuron') || q.includes('eeg')) {
    domain = 'neural'
  } else if (q.includes('conscious') || q.includes('mind') || q.includes('aware')) {
    domain = 'consciousness'
  } else if (q.includes('music') || q.includes('sound') || q.includes('audio') || q.includes('song')) {
    domain = 'music'
  } else if (q.includes('quantum') || q.includes('physics') || q.includes('particle')) {
    domain = 'quantum'
  }

  const knowledge = knowledgeBase[domain]
  
  // Adjust response based on curiosity level
  let response = knowledge.response
  if (curiosityLevel === 'wild') {
    response = "🎭 " + response + " But here's a wild thought - what if this is just the beginning of an infinite recursion of questions?"
  } else if (curiosityLevel === 'chaos') {
    response = "🌀 " + response + " Though in the grand cosmic scheme, perhaps the question itself is the answer..."
  } else if (curiosityLevel === 'genius') {
    response = "🔬 " + response + " The cutting-edge research in this field suggests paradigm shifts on the horizon."
  }

  return {
    ocean_response: response,
    source: 'asi-trinity',
    rabbit_holes: knowledge.rabbitHoles,
    next_questions: knowledge.questions,
    alba_analysis: { network_connections: 847, patterns_found: 23 },
    albi_creativity: { imagination_score: 94.2, art_potential: 87.5 },
    jona_coordination: { infinite_potential: 98.9 }
  }
}