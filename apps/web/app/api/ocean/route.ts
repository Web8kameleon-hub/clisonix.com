import { NextResponse } from 'next/server'

/**
 * CURIOSITY OCEAN API - Hybrid AI Proxy
 * 
 * Proxies to backend /api/ai/curiosity-ocean endpoint
 * Backend provides:
 * - External: Groq Llama 3.3 70B for conversations
 * - Internal: Real system metrics
 * 
 * No sensitive info exposed to client
 */

// In Docker: use container name, outside Docker: use localhost
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://clisonix-api:8000'

export async function POST(request: Request) {
  try {
    const { question, curiosity_level } = await request.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Map curiosity level to backend mode
    const mode = curiosity_level || 'curious'

    try {
      // Call backend hybrid API
      const backendUrl = `${BACKEND_API_URL}/api/ai/curiosity-ocean?question=${encodeURIComponent(question)}&mode=${mode}`
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Transform backend response to clean client format
        return NextResponse.json({
          ocean_response: data.response?.answer || data.response || '🌊 Processing...',
          rabbit_holes: extractRabbitHoles(data.response?.answer || ''),
          next_questions: generateFollowUps(question, mode),
          mode: mode
        })
      }
    } catch {
      // Backend unavailable - fall through to local fallback
    }

    // Local fallback when backend unreachable
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

// Extract related topics from AI response
function extractRabbitHoles(content: string): string[] {
  const lines = content.split('\n')
  const topics: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const topic = trimmed.replace(/^[•\-*]\s*/, '')
      if (topic && topics.length < 3) {
        topics.push(topic)
      }
    }
  }
  
  if (topics.length === 0) {
    return ['Explore deeper', 'Related concepts', 'Advanced topics']
  }
  
  return topics
}

// Generate follow-up questions based on mode
function generateFollowUps(question: string, mode: string): string[] {
  const q = question.toLowerCase()
  
  if (mode === 'wild') {
    return ['What unexpected connections exist?', 'How might this change in the future?']
  } else if (mode === 'chaos') {
    return ['What paradoxes arise here?', 'Where does this lead philosophically?']
  } else if (mode === 'genius') {
    return ['What does current research suggest?', 'What technical details matter?']
  }
  
  // Default curious mode
  if (q.includes('ai') || q.includes('artificial')) {
    return ['How does this impact daily life?', 'What are the limitations?']
  }
  return ['What else would you like to explore?', 'How does this connect to other topics?']
}

// Local fallback: Curated knowledge base
function generateInternalResponse(question: string, curiosityLevel: string) {
  const q = question.toLowerCase()
  
  const knowledge: Record<string, { response: string; topics: string[]; questions: string[] }> = {
    neural: {
      response: "🧠 Neural systems are nature's most sophisticated information processors. The human brain contains approximately 86 billion neurons, each forming thousands of connections. This creates an intricate network capable of thought, emotion, and consciousness.",
      topics: ["Neuroplasticity and learning", "Brain-computer interfaces", "Memory formation"],
      questions: ["How do artificial neural networks compare?", "What determines intelligence?"]
    },
    consciousness: {
      response: "🌌 Consciousness remains science's deepest mystery - the subjective experience of being aware. While we understand much about brain activity, the 'hard problem' persists: how do physical processes create inner experience?",
      topics: ["The hard problem of consciousness", "Meditation and awareness", "Dreams and altered states"],
      questions: ["What creates subjective experience?", "Can machines become conscious?"]
    },
    music: {
      response: "🎵 Music uniquely activates multiple brain regions simultaneously - auditory processing, motor coordination, emotion, and memory. It's a universal human phenomenon, present in every known culture.",
      topics: ["Music and emotion", "Mathematical harmony", "Sound and healing"],
      questions: ["Why does music move us emotionally?", "How did music evolve in humans?"]
    },
    quantum: {
      response: "⚛️ Quantum mechanics reveals a universe stranger than intuition allows. Particles exist in superposition until observed, entanglement connects distant particles instantly, and uncertainty is fundamental.",
      topics: ["Quantum computing basics", "Superposition explained", "Quantum in biology"],
      questions: ["How will quantum change technology?", "Is reality fundamentally probabilistic?"]
    },
    default: {
      response: "🌊 Every question opens new doors to understanding. Human knowledge spans millennia of discovery. The joy of learning lies not just in answers, but in the questions themselves.",
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

  const k = knowledge[domain]
  
  // Adjust for curiosity level
  let response = k.response
  if (curiosityLevel === 'wild') {
    response += "\n\n🎭 But here's a twist - what if our questions shape the answers we find?"
  } else if (curiosityLevel === 'chaos') {
    response += "\n\n🌀 In the grand scheme, understanding and mystery are two sides of the same coin..."
  } else if (curiosityLevel === 'genius') {
    response += "\n\n🔬 Current research is revealing surprising connections to other domains."
  }

  return {
    ocean_response: response,
    rabbit_holes: k.topics,
    next_questions: k.questions
  }
}
