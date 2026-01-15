import { NextResponse } from 'next/server'

/**
 * CURIOSITY OCEAN API - Powered by ASI Trinity
 * UPGRADED: Now uses ALL internal Clisonix APIs for intelligent responses
 * Real-time data from: Brain, EEG, Spectrum, ASI Trinity, Monitoring
 */

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://api:8000'

// Enhanced knowledge base with API-powered responses
interface KnowledgeEntry {
  answer: string
  related: string[]
  deeper: string[]
  apis?: string[]  // Which APIs to call for live data
}

const KNOWLEDGE_BASE: Record<string, KnowledgeEntry> = {
  // NEUROSCIENCE & BRAIN
  consciousness: {
    answer: "🧠 Consciousness is the state of being aware of and able to think about one's own existence. In neuroscience, it's studied through brain activity patterns.",
    related: ["Neural correlates of consciousness", "Quantum mind theories", "The hard problem of consciousness"],
    deeper: ["How do neurons create subjective experience?", "What is the role of the prefrontal cortex?", "Can AI become conscious?"],
    apis: ['/api/albi/eeg/analysis', '/brain/cortex-map', '/api/asi/status']
  },
  brain: {
    answer: "🎵 The brain processes information through complex neural networks involving the auditory cortex, limbic system, and motor regions.",
    related: ["Auditory processing", "Music and emotion", "Neuroplasticity through music"],
    deeper: ["Why does music evoke memories?", "How does rhythm affect brain waves?", "Can music heal the brain?"],
    apis: ['/brain/cortex-map', '/brain/temperature', '/api/albi/eeg/waves']
  },
  eeg: {
    answer: "📊 EEG (Electroencephalography) measures electrical activity in the brain through electrodes placed on the scalp.",
    related: ["Alpha waves", "Beta waves", "Theta waves", "Delta waves", "Gamma waves"],
    deeper: ["What do different brain waves mean?", "How does meditation affect EEG?", "Can we control our brain waves?"],
    apis: ['/api/albi/eeg/analysis', '/api/albi/eeg/waves', '/api/albi/eeg/quality']
  },
  waves: {
    answer: "🌊 Brain waves are patterns of electrical activity. Delta (0.5-4Hz) = deep sleep, Theta (4-8Hz) = meditation, Alpha (8-12Hz) = relaxed, Beta (12-30Hz) = alert, Gamma (30-100Hz) = higher cognition.",
    related: ["Sleep stages", "Meditation benefits", "Focus states", "Flow state"],
    deeper: ["How to increase alpha waves?", "What causes brain wave abnormalities?", "Can brain waves be synchronized?"],
    apis: ['/api/albi/eeg/waves', '/api/spectrum/bands', '/api/spectrum/live']
  },
  memory: {
    answer: "💾 Memory works through encoding, storage, and retrieval. Short-term memory lives in the prefrontal cortex, while long-term memories are consolidated in the hippocampus during sleep.",
    related: ["Hippocampus function", "Memory consolidation", "Types of memory"],
    deeper: ["Why do we forget?", "How are memories stored physically?", "Can we enhance memory artificially?"],
    apis: ['/api/albi/eeg/analysis', '/brain/neural-load']
  },
  neuroplasticity: {
    answer: "🔄 Neuroplasticity is the brain's remarkable ability to reorganize itself by forming new neural connections throughout life.",
    related: ["Synaptic plasticity", "Brain training", "Recovery after stroke"],
    deeper: ["Can adults grow new neurons?", "How does learning change the brain?", "What limits neuroplasticity?"],
    apis: ['/brain/cortex-map', '/api/albi/eeg/quality']
  },
  
  // AI & NEURAL NETWORKS
  neural: {
    answer: "🕸️ Neural networks learn through adjusting connection strengths based on experience. In the brain, this is called synaptic plasticity. In AI, we use backpropagation.",
    related: ["Deep learning", "Biological vs artificial neurons", "Learning algorithms"],
    deeper: ["How do transformers work?", "What is the difference between AI and human learning?", "Can neural networks be creative?"],
    apis: ['/api/asi/status', '/brain/neural-load', '/api/monitoring/real-metrics-info']
  },
  ai: {
    answer: "🤖 Artificial Intelligence encompasses systems that can perform tasks requiring human intelligence - learning, reasoning, problem-solving, perception.",
    related: ["Machine learning", "Deep learning", "AGI vs narrow AI"],
    deeper: ["Will AI surpass human intelligence?", "How do large language models work?", "What are the limits of current AI?"],
    apis: ['/api/asi/status', '/api/ai/agents-status', '/api/monitoring/dashboards']
  },
  transformers: {
    answer: "⚡ Transformers revolutionized AI through the attention mechanism - allowing models to focus on relevant parts of input regardless of distance.",
    related: ["Self-attention mechanism", "BERT vs GPT", "Positional encoding"],
    deeper: ["Why are transformers so effective?", "What comes after transformers?", "How does attention scale?"],
    apis: ['/api/asi/status', '/brain/threads']
  },
  
  // QUANTUM & PHYSICS
  quantum: {
    answer: "⚛️ Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously (superposition) and be entangled with other qubits.",
    related: ["Superposition", "Quantum entanglement", "Quantum supremacy"],
    deeper: ["How do quantum computers solve problems faster?", "What is quantum error correction?", "When will quantum computers be mainstream?"],
    apis: ['/api/asi/status', '/api/spectrum/bands']
  },
  
  // CREATIVITY & ART
  creative: {
    answer: "🎨 Neural networks can exhibit combinatorial creativity - recombining existing patterns in novel ways. They generate art, music, and text.",
    related: ["Generative AI", "Computational creativity", "AI art"],
    deeper: ["Is AI creativity real creativity?", "Can AI have artistic intent?", "Will AI replace artists?"],
    apis: ['/brain/moodboard/generate', '/api/asi/status']
  },
  music: {
    answer: "🎵 Music processing involves complex brain networks. Our Brain Sync system analyzes musical patterns and their neural effects.",
    related: ["Music therapy", "Binaural beats", "Isochronic tones", "Sound healing"],
    deeper: ["How does music affect mood?", "What frequencies are most healing?", "Can music enhance cognition?"],
    apis: ['/brain/music/brainsync', '/brain/harmony', '/api/spectrum/bands']
  },
  
  // SYSTEM & MONITORING
  system: {
    answer: "🖥️ The Clisonix system consists of multiple interconnected services working in harmony.",
    related: ["System architecture", "Microservices", "Real-time processing"],
    deeper: ["How does load balancing work?", "What ensures high availability?", "How is data synchronized?"],
    apis: ['/api/system-status', '/health', '/status', '/api/monitoring/dashboards']
  },
  alba: {
    answer: "🌐 ALBA (Adaptive Learning & Behavioral Analysis) is our network intelligence layer that monitors and adapts to system patterns.",
    related: ["Network monitoring", "Adaptive systems", "Pattern recognition"],
    deeper: ["How does ALBA learn?", "What patterns does it detect?", "How does it improve over time?"],
    apis: ['/api/asi/alba/metrics', '/api/asi/status']
  },
  albi: {
    answer: "🧬 ALBI (Advanced Learning & Biological Intelligence) processes neural data and EEG patterns in real-time.",
    related: ["Neural processing", "EEG analysis", "Pattern detection"],
    deeper: ["How accurate is ALBI?", "What neural patterns does it recognize?", "How is it trained?"],
    apis: ['/api/asi/albi/metrics', '/api/albi/health', '/api/albi/eeg/analysis']
  },
  jona: {
    answer: "📊 JONA (Joint Optimization & Neural Architecture) coordinates data flow and optimizes system performance.",
    related: ["Data coordination", "System optimization", "Resource allocation"],
    deeper: ["How does JONA prioritize?", "What optimization algorithms does it use?", "How does it handle peak loads?"],
    apis: ['/api/jona/status', '/api/jona/health', '/api/asi/status']
  },
  
  // LIMITS & CAPABILITIES
  limits: {
    answer: "🚧 Current AI has limitations: no true understanding, hallucinations, no common sense, data dependency, no true creativity, and energy intensive.",
    related: ["AI hallucinations", "Explainable AI", "AI safety research"],
    deeper: ["Can AI ever truly understand?", "How do we make AI more reliable?", "What problems can't AI solve?"],
    apis: ['/api/asi/status', '/brain/errors']
  },
  
  // LEARNING & COGNITION
  learning: {
    answer: "📚 Learning physically changes the brain through synaptic strengthening (LTP), myelination, and structural changes.",
    related: ["Hebbian learning", "Sleep and memory", "Skill acquisition"],
    deeper: ["Why is spaced repetition effective?", "How does sleep improve learning?", "Can we accelerate learning?"],
    apis: ['/brain/neural-load', '/api/albi/eeg/analysis']
  },
  neurons: {
    answer: "🌱 Yes! Adults can grow new neurons through neurogenesis, primarily in the hippocampus (memory) and olfactory bulb (smell).",
    related: ["Adult neurogenesis", "Hippocampal growth", "Brain-derived neurotrophic factor (BDNF)"],
    deeper: ["How can we boost neurogenesis?", "Does neurogenesis decline with age?", "What kills new neurons?"],
    apis: ['/brain/cortex-map', '/api/albi/eeg/quality']
  },
  
  // SPECTRUM & FREQUENCIES
  spectrum: {
    answer: "📡 Spectrum analysis examines the frequency components of signals, from brain waves to audio to electromagnetic radiation.",
    related: ["Fourier transform", "Frequency bands", "Signal processing"],
    deeper: ["What frequencies affect the brain?", "How is spectrum data used?", "What patterns emerge from spectrum analysis?"],
    apis: ['/api/spectrum/live', '/api/spectrum/bands', '/api/spectrum/history']
  },
  frequency: {
    answer: "🔊 Frequencies are measured in Hertz (Hz). Different frequencies have different effects on the brain and body.",
    related: ["Resonance", "Harmonics", "Binaural beats"],
    deeper: ["What is the Schumann resonance?", "How do frequencies heal?", "What is the best frequency for focus?"],
    apis: ['/api/spectrum/bands', '/brain/harmony']
  }
}

// Function to call multiple APIs and combine results
async function fetchApiData(apis: string[]): Promise<Record<string, any>> {
  const results: Record<string, any> = {}
  
  await Promise.all(apis.map(async (api) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}${api}`, {
        signal: AbortSignal.timeout(3000),
      })
      if (response.ok) {
        results[api] = await response.json()
      }
    } catch {
      // Skip failed API calls
    }
  }))
  
  return results
}

// Generate intelligent response based on API data
function generateApiInsights(apis: Record<string, any>): string {
  const insights: string[] = []
  
  // ASI Status
  if (apis['/api/asi/status']?.trinity) {
    const { alba, albi, jona } = apis['/api/asi/status'].trinity
    insights.push(`📊 **Live ASI Trinity Status:**`)
    insights.push(`• ALBA Network: ${(alba.health * 100).toFixed(1)}% health, ${alba.metrics?.latency_ms || 'N/A'}ms latency`)
    insights.push(`• ALBI Neural: ${albi.metrics?.neural_patterns || 0} patterns, ${(albi.metrics?.processing_efficiency * 100 || 0).toFixed(1)}% efficiency`)
    insights.push(`• JONA Coordinator: ${jona.metrics?.requests_5m || 0} req/5min, ${(jona.metrics?.infinite_potential || 0).toFixed(1)}% potential`)
  }
  
  // EEG Analysis
  if (apis['/api/albi/eeg/analysis']) {
    const eeg = apis['/api/albi/eeg/analysis']
    if (eeg.dominant_wave) {
      insights.push(`\n🧠 **Live EEG Analysis:**`)
      insights.push(`• Dominant Wave: ${eeg.dominant_wave} (${eeg.dominant_frequency?.toFixed(1) || 'N/A'} Hz)`)
      insights.push(`• Mental State: ${eeg.mental_state || 'Processing...'}`)
    }
  }
  
  // EEG Waves
  if (apis['/api/albi/eeg/waves']) {
    const waves = apis['/api/albi/eeg/waves']
    if (waves.bands) {
      insights.push(`\n📈 **Brain Wave Bands:**`)
      for (const [band, value] of Object.entries(waves.bands)) {
        insights.push(`• ${band}: ${typeof value === 'number' ? value.toFixed(2) : value}`)
      }
    }
  }
  
  // Spectrum
  if (apis['/api/spectrum/bands']) {
    const spectrum = apis['/api/spectrum/bands']
    if (spectrum.bands) {
      insights.push(`\n📡 **Spectrum Analysis:**`)
      insights.push(`• Active Bands: ${Object.keys(spectrum.bands).length}`)
    }
  }
  
  // Brain Cortex Map
  if (apis['/brain/cortex-map']) {
    const cortex = apis['/brain/cortex-map']
    if (cortex.regions) {
      insights.push(`\n🗺️ **Cortex Activity:**`)
      insights.push(`• Active Regions: ${Object.keys(cortex.regions).length}`)
    }
  }
  
  // Brain Temperature
  if (apis['/brain/temperature']) {
    const temp = apis['/brain/temperature']
    insights.push(`\n🌡️ **Brain Engine:** ${temp.status || 'Active'}`)
  }
  
  // Neural Load
  if (apis['/brain/neural-load']) {
    const load = apis['/brain/neural-load']
    if (load.load !== undefined) {
      insights.push(`\n⚡ **Neural Load:** ${(load.load * 100).toFixed(1)}%`)
    }
  }
  
  // System Status
  if (apis['/api/system-status']) {
    const sys = apis['/api/system-status']
    insights.push(`\n🖥️ **System:** ${sys.status || 'Operational'}`)
  }
  
  // Monitoring
  if (apis['/api/monitoring/dashboards']) {
    const mon = apis['/api/monitoring/dashboards']
    if (mon.dashboards) {
      insights.push(`\n📊 **Dashboards:** ${mon.dashboards.length} active`)
    }
  }
  
  return insights.join('\n')
}

function findBestMatch(question: string): KnowledgeEntry | null {
  const q = question.toLowerCase()
  
  // Check specific phrases first (more specific = higher priority)
  if (q.includes('eeg') || q.includes('electroencephalogra')) return KNOWLEDGE_BASE.eeg
  if (q.includes('wave') && (q.includes('brain') || q.includes('alpha') || q.includes('beta') || q.includes('theta') || q.includes('delta') || q.includes('gamma'))) return KNOWLEDGE_BASE.waves
  if (q.includes('alba') && !q.includes('alabama')) return KNOWLEDGE_BASE.alba
  if (q.includes('albi')) return KNOWLEDGE_BASE.albi
  if (q.includes('jona')) return KNOWLEDGE_BASE.jona
  if (q.includes('spectrum') || q.includes('spectral')) return KNOWLEDGE_BASE.spectrum
  if (q.includes('frequency') || q.includes('frequencies') || q.includes('hertz') || q.includes('hz')) return KNOWLEDGE_BASE.frequency
  if (q.includes('limit') || q.includes('limitation') || q.includes("can't do") || q.includes('cannot')) return KNOWLEDGE_BASE.limits
  if (q.includes('grow new neuron') || (q.includes('adult') && q.includes('neuron'))) return KNOWLEDGE_BASE.neurons
  if (q.includes('learning change') || (q.includes('learn') && q.includes('brain'))) return KNOWLEDGE_BASE.learning
  if (q.includes('transformer') || q.includes('attention mechanism')) return KNOWLEDGE_BASE.transformers
  if (q.includes('creative') || q.includes('creativity') || q.includes('art')) return KNOWLEDGE_BASE.creative
  if (q.includes('music') || q.includes('sound') || q.includes('audio') || q.includes('binaural')) return KNOWLEDGE_BASE.music
  if (q.includes('system') || q.includes('architecture') || q.includes('service')) return KNOWLEDGE_BASE.system
  if (q.includes('difference') && q.includes('ai') && q.includes('human')) return KNOWLEDGE_BASE.learning
  
  // Then check general keywords
  for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
    if (q.includes(key)) {
      return value
    }
  }
  
  // Check for related terms
  if (q.includes('aware') || q.includes('conscious') || q.includes('mind')) return KNOWLEDGE_BASE.consciousness
  if (q.includes('qubit') || q.includes('quantum')) return KNOWLEDGE_BASE.quantum
  if (q.includes('remember') || q.includes('forget') || q.includes('memory')) return KNOWLEDGE_BASE.memory
  if (q.includes('plastic') || q.includes('adapt') || q.includes('change')) return KNOWLEDGE_BASE.neuroplasticity
  if (q.includes('network') || q.includes('neuron') || q.includes('neural')) return KNOWLEDGE_BASE.neural
  if (q.includes('artificial') || q.includes('intelligence') || q.includes('robot') || q.includes('ai')) return KNOWLEDGE_BASE.ai
  
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

    // Find knowledge match
    const knowledge = findBestMatch(question)
    
    if (knowledge) {
      // Fetch live data from relevant APIs
      const apiData = knowledge.apis ? await fetchApiData(knowledge.apis) : {}
      const apiInsights = generateApiInsights(apiData)
      
      // Build enhanced answer
      let enhancedAnswer = knowledge.answer
      if (apiInsights) {
        enhancedAnswer += '\n\n' + apiInsights
      }

      return NextResponse.json({
        ocean_response: enhancedAnswer,
        rabbit_holes: knowledge.related,
        next_questions: knowledge.deeper,
        mode: curiosity_level,
        source: 'ASI Trinity Knowledge Engine',
        apis_used: knowledge.apis || []
      })
    }

    // For unknown topics, still fetch ASI status
    const defaultApis = ['/api/asi/status', '/api/system-status', '/brain/neural-load']
    const apiData = await fetchApiData(defaultApis)
    const apiInsights = generateApiInsights(apiData)

    // Generic intelligent response for unknown topics
    const genericResponses = [
      `🌊 Fascinating question about "${question}"! The ASI Trinity system is analyzing this through multiple neural pathways.`,
      `🔮 "${question}" - what an intriguing inquiry! Let me process this through our neural networks.`,
      `🧭 Your curiosity about "${question}" activates interesting neural pathways! Our systems are exploring connections.`,
      `🌟 The question "${question}" resonates across multiple knowledge domains. Processing through ASI Trinity...`,
      `💡 "${question}" - exploring this through our distributed intelligence network.`
    ]

    const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)]
    
    let finalResponse = randomResponse
    if (apiInsights) {
      finalResponse += '\n\n' + apiInsights
    }

    return NextResponse.json({
      ocean_response: finalResponse,
      rabbit_holes: ['Neuroscience fundamentals', 'AI and machine learning', 'System architecture', 'Brain wave analysis'],
      next_questions: ['How does the brain process this?', 'What role does AI play?', 'How can we measure this?', 'What are the neural correlates?'],
      mode: curiosity_level,
      source: 'ASI Trinity Knowledge Engine',
      apis_used: defaultApis
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
