import { NextResponse } from 'next/server'

/**
 * CURIOSITY OCEAN API - Hybrid AI System
 * 
 * Architecture:
 * - External: Groq API for conversational AI
 * - Internal: Fallback knowledge base when API unavailable
 * 
 * No sensitive info exposed to client
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(request: Request) {
  try {
    const { question, curiosity_level } = await request.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Try external AI first (Groq)
    if (GROQ_API_KEY) {
      try {
        const aiResponse = await callGroqAPI(question, curiosity_level)
        return NextResponse.json(aiResponse)
      } catch {
        // Fall through to internal fallback
      }
    }

    // Internal fallback - curated knowledge responses
    const fallbackResponse = generateInternalResponse(question, curiosity_level)
    return NextResponse.json(fallbackResponse)

  } catch {
    return NextResponse.json({
      ocean_response: '🌊 The Ocean is experiencing turbulence. Please try again.',
      rabbit_holes: [],
      next_questions: []
    }, { status: 500 })
  }
}

// External AI: Groq API call
async function callGroqAPI(question: string, curiosityLevel: string) {
  const systemPrompt = `You are Curiosity Ocean - an infinite knowledge engine that helps users explore ideas.

Your personality adapts to curiosity level:
- curious: Thoughtful, educational, connecting ideas
- wild: Creative, unexpected perspectives, playful
- chaos: Philosophical, mind-bending, abstract
- genius: Deep, technical, cutting-edge insights

Current mode: ${curiosityLevel || 'curious'}

Response format:
1. Main insight (2-3 clear sentences)
2. Then list 2-3 related topics to explore (start each with •)
3. Then 2 follow-up questions (start each with ?)

Be concise. Use emojis sparingly. Be genuinely helpful and insightful.`

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
    throw new Error('API unavailable')
  }

  const data = await response.json()
  const aiContent = data.choices?.[0]?.message?.content || ''

  // Parse response
  const { mainResponse, rabbitHoles, questions } = parseAIResponse(aiContent)

  return {
    ocean_response: mainResponse || aiContent,
    rabbit_holes: rabbitHoles,
    next_questions: questions
  }
}

// Parse AI response to extract structure
function parseAIResponse(content: string) {
  const lines = content.split('\n')
  const mainLines: string[] = []
  const rabbitHoles: string[] = []
  const questions: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const topic = trimmed.replace(/^[•\-*]\s*/, '')
      if (topic && rabbitHoles.length < 3) {
        rabbitHoles.push(topic)
      }
    } else if (trimmed.startsWith('?')) {
      const q = trimmed.replace(/^\?\s*/, '')
      if (q && questions.length < 2) {
        questions.push(q)
      }
    } else if (trimmed && !trimmed.toLowerCase().includes('rabbit') && !trimmed.toLowerCase().includes('question')) {
      mainLines.push(trimmed)
    }
  }

  return {
    mainResponse: mainLines.join('\n'),
    rabbitHoles,
    questions
  }
}

// Internal fallback: Curated knowledge base
function generateInternalResponse(question: string, curiosityLevel: string) {
  const q = question.toLowerCase()
  
  const knowledge: Record<string, { response: string; topics: string[]; questions: string[] }> = {
    neural: {
      response: "🧠 Neural systems are nature's most sophisticated information processors. The human brain contains approximately 86 billion neurons, each forming thousands of connections. This creates an intricate network capable of thought, emotion, and consciousness - the most complex known structure in the universe.",
      topics: ["Neuroplasticity and learning", "Brain-computer interfaces", "Memory formation"],
      questions: ["How do artificial neural networks compare?", "What determines intelligence?"]
    },
    consciousness: {
      response: "🌌 Consciousness remains science's deepest mystery - the subjective experience of being aware. While we understand much about brain activity, the 'hard problem' persists: how do physical processes create inner experience? Various theories propose answers, from integrated information to global workspace models.",
      topics: ["The hard problem of consciousness", "Meditation and awareness", "Dreams and altered states"],
      questions: ["What creates subjective experience?", "Can machines become conscious?"]
    },
    music: {
      response: "🎵 Music uniquely activates multiple brain regions simultaneously - auditory processing, motor coordination, emotion, and memory. It's a universal human phenomenon, present in every known culture. Mathematical patterns underlie harmony, yet music speaks to us emotionally in ways logic cannot explain.",
      topics: ["Music and emotion", "Mathematical harmony", "Sound and healing"],
      questions: ["Why does music move us emotionally?", "How did music evolve in humans?"]
    },
    quantum: {
      response: "⚛️ Quantum mechanics reveals a universe stranger than intuition allows. Particles exist in superposition until observed, entanglement connects distant particles instantly, and uncertainty is fundamental. These phenomena enable quantum computing and challenge our understanding of reality itself.",
      topics: ["Quantum computing basics", "Superposition explained", "Quantum in biology"],
      questions: ["How will quantum change technology?", "Is reality fundamentally probabilistic?"]
    },
    memory: {
      response: "💭 Memory is not a simple recording - it's an active reconstruction process. Every time we remember, we slightly alter the memory. Short-term memory holds about 7 items briefly, while long-term memory can last a lifetime. Sleep plays a crucial role in memory consolidation.",
      topics: ["How memories form", "Sleep and memory", "False memories"],
      questions: ["Why do we forget?", "Can memories be enhanced?"]
    },
    ai: {
      response: "🤖 Artificial intelligence has evolved from rule-based systems to learning machines. Modern AI uses neural networks inspired by biology, finding patterns in vast datasets. While impressive at specific tasks, general intelligence remains elusive. The field raises profound questions about mind and machine.",
      topics: ["Machine learning basics", "AI capabilities today", "Future of AI"],
      questions: ["Will AI surpass human intelligence?", "What can't AI do?"]
    },
    default: {
      response: "🌊 Every question opens new doors to understanding. Human knowledge spans millennia of discovery, from ancient philosophy to quantum physics. The joy of learning lies not just in answers, but in the questions themselves - each one a portal to deeper exploration.",
      topics: ["The nature of curiosity", "How knowledge grows", "Great questions in science"],
      questions: ["What else intrigues you?", "Where does this question lead?"]
    }
  }

  // Match domain
  let domain = 'default'
  if (q.includes('neural') || q.includes('brain') || q.includes('neuron')) domain = 'neural'
  else if (q.includes('conscious') || q.includes('aware') || q.includes('mind')) domain = 'consciousness'
  else if (q.includes('music') || q.includes('sound') || q.includes('song')) domain = 'music'
  else if (q.includes('quantum') || q.includes('physics') || q.includes('particle')) domain = 'quantum'
  else if (q.includes('memory') || q.includes('remember') || q.includes('forget')) domain = 'memory'
  else if (q.includes('ai') || q.includes('artificial') || q.includes('machine learning')) domain = 'ai'

  const k = knowledge[domain]
  
  // Adjust for curiosity level
  let response = k.response
  if (curiosityLevel === 'wild') {
    response += "\n\n🎭 But here's a twist - what if our questions shape the answers we find?"
  } else if (curiosityLevel === 'chaos') {
    response += "\n\n🌀 In the grand scheme, perhaps understanding and mystery are two sides of the same coin..."
  } else if (curiosityLevel === 'genius') {
    response += "\n\n🔬 Current research in this field is revealing surprising connections to other domains."
  }

  return {
    ocean_response: response,
    rabbit_holes: k.topics,
    next_questions: k.questions
  }
}
