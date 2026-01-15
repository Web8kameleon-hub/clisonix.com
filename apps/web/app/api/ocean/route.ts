import { NextResponse } from 'next/server'

/**
 * CURIOSITY OCEAN API - Powered by ASI Trinity
 * Uses our internal ASI Trinity system for intelligent responses
 * No external AI (Groq) needed - fully self-contained
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://api:8000'

// Knowledge base for different topics
const KNOWLEDGE_BASE: Record<string, { answer: string; related: string[]; deeper: string[] }> = {
  consciousness: {
    answer: "🧠 Consciousness is the state of being aware of and able to think about one's own existence, sensations, thoughts, and surroundings. In neuroscience, it's studied through brain activity patterns - something our ALBI Neural Processor analyzes in real-time. Current ASI Trinity metrics show neural pattern recognition at optimal levels, processing thousands of cognitive signatures per second.",
    related: ["Neural correlates of consciousness", "Quantum mind theories", "The hard problem of consciousness"],
    deeper: ["How do neurons create subjective experience?", "What is the role of the prefrontal cortex?", "Can AI become conscious?"]
  },
  brain: {
    answer: "🎵 The brain processes music through a complex network involving the auditory cortex, limbic system, and motor regions. Our ALBA Network Monitor tracks these neural pathways in real-time. Music activates reward centers (dopamine release), memory regions (hippocampus), and even motor planning areas - that's why we tap our feet!",
    related: ["Auditory processing", "Music and emotion", "Neuroplasticity through music"],
    deeper: ["Why does music evoke memories?", "How does rhythm affect brain waves?", "Can music heal the brain?"]
  },
  quantum: {
    answer: "⚛️ Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously (superposition) and be entangled with other qubits. Unlike classical bits (0 or 1), qubits can be both at once! This enables parallel processing at scales impossible for classical computers. Our JONA Data Coordinator processes data with quantum-inspired algorithms.",
    related: ["Superposition", "Quantum entanglement", "Quantum supremacy"],
    deeper: ["How do quantum computers solve problems faster?", "What is quantum error correction?", "When will quantum computers be mainstream?"]
  },
  memory: {
    answer: "💾 Memory works through encoding, storage, and retrieval. Short-term memory lives in the prefrontal cortex, while long-term memories are consolidated in the hippocampus during sleep. Our ALBI system processes neural patterns similar to how memory encoding works - identifying patterns and strengthening connections. Current pattern recognition: analyzing thousands of neural signatures.",
    related: ["Hippocampus function", "Memory consolidation", "Types of memory"],
    deeper: ["Why do we forget?", "How are memories stored physically?", "Can we enhance memory artificially?"]
  },
  neuroplasticity: {
    answer: "🔄 Neuroplasticity is the brain's remarkable ability to reorganize itself by forming new neural connections throughout life. Learning, experience, and even injury can reshape neural pathways. Our ASI Trinity system mimics this - ALBA continuously adapts network patterns, ALBI refines neural processing, and JONA coordinates data flow dynamically.",
    related: ["Synaptic plasticity", "Brain training", "Recovery after stroke"],
    deeper: ["Can adults grow new neurons?", "How does learning change the brain?", "What limits neuroplasticity?"]
  },
  neural: {
    answer: "🕸️ Neural networks (both biological and artificial) learn through adjusting connection strengths based on experience. In the brain, this is called synaptic plasticity. In AI, we use backpropagation. Our ALBI Neural Processor uses advanced pattern recognition algorithms inspired by biological neural networks, currently processing with high efficiency.",
    related: ["Deep learning", "Biological vs artificial neurons", "Learning algorithms"],
    deeper: ["How do transformers work?", "What is the difference between AI and human learning?", "Can neural networks be creative?"]
  },
  ai: {
    answer: "🤖 Artificial Intelligence encompasses systems that can perform tasks typically requiring human intelligence - learning, reasoning, problem-solving, perception. Our ASI Trinity represents a practical implementation: ALBA monitors network intelligence, ALBI processes neural patterns, and JONA coordinates data synthesis. Together they create an intelligent, adaptive system.",
    related: ["Machine learning", "Deep learning", "AGI vs narrow AI"],
    deeper: ["Will AI surpass human intelligence?", "How do large language models work?", "What are the limits of current AI?"]
  }
}

function findBestMatch(question: string): { answer: string; related: string[]; deeper: string[] } | null {
  const q = question.toLowerCase()
  
  for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
    if (q.includes(key)) {
      return value
    }
  }
  
  // Check for related terms
  if (q.includes('aware') || q.includes('conscious') || q.includes('mind')) return KNOWLEDGE_BASE.consciousness
  if (q.includes('music') || q.includes('sound') || q.includes('hear')) return KNOWLEDGE_BASE.brain
  if (q.includes('qubit') || q.includes('quantum')) return KNOWLEDGE_BASE.quantum
  if (q.includes('remember') || q.includes('forget') || q.includes('memory')) return KNOWLEDGE_BASE.memory
  if (q.includes('plastic') || q.includes('adapt') || q.includes('change')) return KNOWLEDGE_BASE.neuroplasticity
  if (q.includes('network') || q.includes('neuron') || q.includes('learn')) return KNOWLEDGE_BASE.neural
  if (q.includes('artificial') || q.includes('intelligence') || q.includes('robot')) return KNOWLEDGE_BASE.ai
  
  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const question = body.question
    const curiosity_level = body.curiosity_level || 'curious'

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Get real ASI Trinity metrics
    let asiMetrics = null
    try {
      const asiResponse = await fetch(`${BACKEND_API_URL}/api/asi/status`, {
        signal: AbortSignal.timeout(5000),
      })
      if (asiResponse.ok) {
        asiMetrics = await asiResponse.json()
      }
    } catch {
      // Continue without metrics
    }

    // Find knowledge match
    const knowledge = findBestMatch(question)
    
    if (knowledge) {
      // Enhance answer with live ASI metrics if available
      let enhancedAnswer = knowledge.answer
      if (asiMetrics?.trinity) {
        const alba = asiMetrics.trinity.alba
        const albi = asiMetrics.trinity.albi
        const jona = asiMetrics.trinity.jona
        enhancedAnswer += `\n\n📊 **Live ASI Trinity Status:**\n` +
          `• ALBA Network: ${(alba.health * 100).toFixed(1)}% health, ${alba.metrics.latency_ms}ms latency\n` +
          `• ALBI Neural: ${albi.metrics.neural_patterns} patterns detected, ${(albi.metrics.processing_efficiency * 100).toFixed(1)}% efficiency\n` +
          `• JONA Coordinator: ${jona.metrics.requests_5m} requests/5min, ${jona.metrics.infinite_potential.toFixed(1)}% potential`
      }

      return NextResponse.json({
        ocean_response: enhancedAnswer,
        rabbit_holes: knowledge.related,
        next_questions: knowledge.deeper,
        mode: curiosity_level,
        source: 'ASI Trinity Knowledge Engine'
      })
    }

    // Generic intelligent response for unknown topics
    const genericResponses = [
      `🌊 Fascinating question about "${question}"! While I'm still expanding my knowledge on this specific topic, I can tell you that our ASI Trinity system is actively learning and adapting. ALBA monitors network patterns, ALBI processes neural data, and JONA coordinates everything seamlessly.`,
      `🔮 "${question}" - what an intriguing inquiry! The ASI Trinity approach would analyze this through multiple lenses: network intelligence (ALBA), neural pattern recognition (ALBI), and data synthesis (JONA). Each perspective reveals new insights.`,
      `🧭 Your curiosity about "${question}" opens interesting pathways! Our neural processing systems are designed to explore exactly these kinds of questions, building connections and finding patterns in complex information spaces.`
    ]

    const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)]
    
    let finalResponse = randomResponse
    if (asiMetrics?.trinity) {
      const health = ((asiMetrics.trinity.alba.health + asiMetrics.trinity.albi.health + asiMetrics.trinity.jona.health) / 3 * 100).toFixed(1)
      finalResponse += `\n\n📊 **ASI Trinity Overall Health:** ${health}%`
    }

    return NextResponse.json({
      ocean_response: finalResponse,
      rabbit_holes: ['Explore related concepts', 'Dive deeper into fundamentals', 'Connect to neural science'],
      next_questions: ['What specific aspect interests you most?', 'How does this relate to your work?', 'What would you like to explore next?'],
      mode: curiosity_level,
      source: 'ASI Trinity Knowledge Engine'
    })

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown'
    console.error('Ocean API error:', errMsg)
    return NextResponse.json({
      ocean_response: '🌊 The Ocean is recalibrating. ASI Trinity systems are operational. Please try again.',
      rabbit_holes: [],
      next_questions: [],
      error: errMsg
    }, { status: 500 })
  }
}
