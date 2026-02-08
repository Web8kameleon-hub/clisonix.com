'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Compass, Send, Sparkles, Lightbulb, RefreshCw, ChevronRight, Loader2, Zap, Globe, Mic, Camera, FileText, X, Square } from 'lucide-react';

// Clerk hooks - safe import for build time
let useAuthHook: () => { userId: string | null; isSignedIn: boolean | undefined } = () => ({ userId: null, isSignedIn: false });
let useUserHook: () => { user: { firstName?: string | null; username?: string | null } | null | undefined } = () => ({ user: null });

// Only import Clerk on client side
if (typeof window !== 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clerk = require('@clerk/nextjs');
    useAuthHook = clerk.useAuth;
    useUserHook = clerk.useUser;
  } catch {
    // Clerk not available, use defaults
  }
}

/**
 * CURIOSITY OCEAN - Interactive AI Chat with STREAMING
 * Real-time streaming responses - text appears as AI generates it
 * Supports multiple languages with automatic browser detection
 */

// Translations for UI elements
const translations: Record<string, {
  welcome: string;
  chatCleared: string;
  banner: string;
  modules: string;
  title: string;
  subtitle: string;
  streaming: string;
  normal: string;
  curious: string;
  wild: string;
  chaos: string;
  genius: string;
  tryAsking: string;
  askAnything: string;
  thinking: string;
  streamingIndicator: string;
  exploreFurther: string;
  continueWith: string;
  stopButton: string;
}> = {
  en: {
    welcome: "🌊 Welcome to Curiosity Ocean! Ask me anything and let's explore the depths of knowledge together. What sparks your curiosity today?",
    chatCleared: "🌊 Chat cleared! Ready for new explorations. What would you like to discover?",
    banner: "⚡ Streaming Mode — Responses appear in real-time as AI thinks",
    modules: "← Modules",
    title: "Curiosity Ocean",
    subtitle: "Infinite Knowledge Engine",
    streaming: "Stream",
    normal: "Normal",
    curious: "🔍 Curious",
    wild: "🌀 Wild",
    chaos: "⚡ Chaos",
    genius: "🧠 Genius",
    tryAsking: "💡 Try asking:",
    askAnything: "Ask anything... 🌊",
    thinking: "Thinking",
    streamingIndicator: "● streaming...",
    exploreFurther: "Explore further:",
    continueWith: "💭 Continue with:",
    stopButton: "Stop",
  },
  sq: {
    welcome: "🌊 Mirë se vini në Curiosity Ocean! Më pyet çfarëdo dhe le të eksplorojmë thellësitë e dijes së bashku. Çfarë të bën kurioz sot?",
    chatCleared: "🌊 Biseda u pastrua! Gati për eksplorime të reja. Çfarë dëshironi të zbuloni?",
    banner: "⚡ Modaliteti Streaming — Përgjigjet shfaqen në kohë reale ndërsa AI mendon",
    modules: "← Modulet",
    title: "Curiosity Ocean",
    subtitle: "Motori i Pafund i Dijes",
    streaming: "Stream",
    normal: "Normal",
    curious: "🔍 Kurioz",
    wild: "🌀 I egër",
    chaos: "⚡ Kaos",
    genius: "🧠 Gjeni",
    tryAsking: "💡 Provo të pyesësh:",
    askAnything: "Pyet çfarëdo... 🌊",
    thinking: "Duke menduar",
    streamingIndicator: "● duke transmetuar...",
    exploreFurther: "Eksploro më shumë:",
    continueWith: "💭 Vazhdo me:",
    stopButton: "Ndalo",
  },
  de: {
    welcome: "🌊 Willkommen bei Curiosity Ocean! Frag mich alles und lass uns gemeinsam die Tiefen des Wissens erkunden. Was weckt heute deine Neugier?",
    chatCleared: "🌊 Chat gelöscht! Bereit für neue Erkundungen. Was möchtest du entdecken?",
    banner: "⚡ Streaming-Modus — Antworten erscheinen in Echtzeit während die KI denkt",
    modules: "← Module",
    title: "Curiosity Ocean",
    subtitle: "Unendliche Wissensmaschine",
    streaming: "Stream",
    normal: "Normal",
    curious: "🔍 Neugierig",
    wild: "🌀 Wild",
    chaos: "⚡ Chaos",
    genius: "🧠 Genie",
    tryAsking: "💡 Probier zu fragen:",
    askAnything: "Frag alles... 🌊",
    thinking: "Denke nach",
    streamingIndicator: "● streame...",
    exploreFurther: "Weiter erkunden:",
    continueWith: "💭 Weitermachen mit:",
    stopButton: "Stopp",
  },
  es: {
    welcome: "🌊 ¡Bienvenido a Curiosity Ocean! Pregúntame lo que quieras y exploremos juntos las profundidades del conocimiento. ¿Qué despierta tu curiosidad hoy?",
    chatCleared: "🌊 ¡Chat borrado! Listo para nuevas exploraciones. ¿Qué te gustaría descubrir?",
    banner: "⚡ Modo Streaming — Las respuestas aparecen en tiempo real mientras la IA piensa",
    modules: "← Módulos",
    title: "Curiosity Ocean",
    subtitle: "Motor de Conocimiento Infinito",
    streaming: "Stream",
    normal: "Normal",
    curious: "🔍 Curioso",
    wild: "🌀 Salvaje",
    chaos: "⚡ Caos",
    genius: "🧠 Genio",
    tryAsking: "💡 Intenta preguntar:",
    askAnything: "Pregunta lo que sea... 🌊",
    thinking: "Pensando",
    streamingIndicator: "● transmitiendo...",
    exploreFurther: "Explorar más:",
    continueWith: "💭 Continuar con:",
    stopButton: "Parar",
  },
  fr: {
    welcome: "🌊 Bienvenue sur Curiosity Ocean! Pose-moi n'importe quelle question et explorons ensemble les profondeurs du savoir. Qu'est-ce qui éveille ta curiosité aujourd'hui?",
    chatCleared: "🌊 Chat effacé! Prêt pour de nouvelles explorations. Que veux-tu découvrir?",
    banner: "⚡ Mode Streaming — Les réponses apparaissent en temps réel pendant que l'IA réfléchit",
    modules: "← Modules",
    title: "Curiosity Ocean",
    subtitle: "Moteur de Connaissance Infinie",
    streaming: "Stream",
    normal: "Normal",
    curious: "🔍 Curieux",
    wild: "🌀 Sauvage",
    chaos: "⚡ Chaos",
    genius: "🧠 Génie",
    tryAsking: "💡 Essaye de demander:",
    askAnything: "Demande n'importe quoi... 🌊",
    thinking: "Je réfléchis",
    streamingIndicator: "● diffusion...",
    exploreFurther: "Explorer plus:",
    continueWith: "💭 Continuer avec:",
    stopButton: "Arrêter",
  },
  it: {
    welcome: "🌊 Benvenuto su Curiosity Ocean! Chiedimi qualsiasi cosa ed esploriamo insieme le profondità della conoscenza. Cosa suscita la tua curiosità oggi?",
    chatCleared: "🌊 Chat cancellata! Pronto per nuove esplorazioni. Cosa vorresti scoprire?",
    banner: "⚡ Modalità Streaming — Le risposte appaiono in tempo reale mentre l'IA pensa",
    modules: "← Moduli",
    title: "Curiosity Ocean",
    subtitle: "Motore di Conoscenza Infinita",
    streaming: "Stream",
    normal: "Normale",
    curious: "🔍 Curioso",
    wild: "🌀 Selvaggio",
    chaos: "⚡ Caos",
    genius: "🧠 Genio",
    tryAsking: "💡 Prova a chiedere:",
    askAnything: "Chiedi qualsiasi cosa... 🌊",
    thinking: "Sto pensando",
    streamingIndicator: "● streaming...",
    exploreFurther: "Esplora di più:",
    continueWith: "💭 Continua con:",
    stopButton: "Ferma",
  },
  zh: {
    welcome: "🌊 欢迎来到Curiosity Ocean！问我任何问题，让我们一起探索知识的深度。今天什么激发了你的好奇心？",
    chatCleared: "🌊 聊天已清除！准备好新的探索。你想发现什么？",
    banner: "⚡ 流媒体模式 — 响应实时显示",
    modules: "← 模块",
    title: "Curiosity Ocean",
    subtitle: "无限知识引擎",
    streaming: "流",
    normal: "普通",
    curious: "🔍 好奇",
    wild: "🌀 狂野",
    chaos: "⚡ 混沌",
    genius: "🧠 天才",
    tryAsking: "💡 试着问：",
    askAnything: "问任何问题... 🌊",
    thinking: "思考中",
    streamingIndicator: "● 流媒体...",
    exploreFurther: "深入探索：",
    continueWith: "💭 继续：",
    stopButton: "停止",
  },
  ja: {
    welcome: "🌊 Curiosity Oceanへようこそ！何でも聞いてください。一緒に知識の深みを探検しましょう。今日は何があなたの好奇心をかきたてますか？",
    chatCleared: "🌊 チャットがクリアされました！新しい探検の準備ができました。何を発見したいですか？",
    banner: "⚡ ストリーミングモード — AIが考えている間にリアルタイムで応答が表示されます",
    modules: "← モジュール",
    title: "Curiosity Ocean",
    subtitle: "無限の知識エンジン",
    streaming: "ストリーム",
    normal: "通常",
    curious: "🔍 好奇心",
    wild: "🌀 ワイルド",
    chaos: "⚡ カオス",
    genius: "🧠 天才",
    tryAsking: "💡 質問してみてください：",
    askAnything: "何でも聞いてください... 🌊",
    thinking: "考え中",
    streamingIndicator: "● ストリーミング中...",
    exploreFurther: "さらに探る：",
    continueWith: "💭 続ける：",
    stopButton: "停止",
  },
  ko: {
    welcome: "🌊 Curiosity Ocean에 오신 것을 환영합니다! 무엇이든 물어보세요. 함께 지식의 깊이를 탐험해 봅시다. 오늘 무엇이 당신의 호기심을 자극하나요?",
    chatCleared: "🌊 채팅이 삭제되었습니다! 새로운 탐험 준비가 되었습니다. 무엇을 발견하고 싶으신가요?",
    banner: "⚡ 스트리밍 모드 — AI가 생각하는 동안 실시간으로 응답이 나타납니다",
    modules: "← 모듈",
    title: "Curiosity Ocean",
    subtitle: "무한 지식 엔진",
    streaming: "스트림",
    normal: "일반",
    curious: "🔍 호기심",
    wild: "🌀 와일드",
    chaos: "⚡ 카오스",
    genius: "🧠 천재",
    tryAsking: "💡 질문해 보세요:",
    askAnything: "무엇이든 물어보세요... 🌊",
    thinking: "생각 중",
    streamingIndicator: "● 스트리밍...",
    exploreFurther: "더 탐구하기:",
    continueWith: "💭 계속하기:",
    stopButton: "중지",
  },
};

// Get language code from browser
function detectLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  return translations[browserLang] ? browserLang : 'en';
}

// Suggested questions per language
const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  en: [
    "What is consciousness?",
    "How does the brain process music?",
    "Explain quantum computing simply",
    "How does memory work?",
    "What is neuroplasticity?",
    "How do neural networks learn?",
  ],
  sq: [
    "Çfarë është vetëdija?",
    "Si e përpunon truri muzikën?",
    "Shpjego kompjuterin kuantik thjesht",
    "Si funksionon kujtesa?",
    "Çfarë është neuroplasticiteti?",
    "Si mësojnë rrjetet neurale?",
  ],
  de: [
    "Was ist Bewusstsein?",
    "Wie verarbeitet das Gehirn Musik?",
    "Erkläre Quantencomputing einfach",
    "Wie funktioniert das Gedächtnis?",
    "Was ist Neuroplastizität?",
    "Wie lernen neuronale Netze?",
  ],
  es: [
    "¿Qué es la consciencia?",
    "¿Cómo procesa el cerebro la música?",
    "Explica la computación cuántica simplemente",
    "¿Cómo funciona la memoria?",
    "¿Qué es la neuroplasticidad?",
    "¿Cómo aprenden las redes neuronales?",
  ],
  fr: [
    "Qu'est-ce que la conscience?",
    "Comment le cerveau traite-t-il la musique?",
    "Explique l'informatique quantique simplement",
    "Comment fonctionne la mémoire?",
    "Qu'est-ce que la neuroplasticité?",
    "Comment les réseaux neuronaux apprennent-ils?",
  ],
  it: [
    "Cos'è la coscienza?",
    "Come elabora il cervello la musica?",
    "Spiega il calcolo quantistico semplicemente",
    "Come funziona la memoria?",
    "Cos'è la neuroplasticità?",
    "Come imparano le reti neurali?",
  ],
  zh: [
    "什么是意识？",
    "大脑如何处理音乐？",
    "简单解释量子计算",
    "记忆是如何工作的？",
    "什么是神经可塑性？",
    "神经网络如何学习？",
  ],
  ja: [
    "意識とは何ですか？",
    "脳はどのように音楽を処理しますか？",
    "量子コンピューティングを簡単に説明してください",
    "記憶はどのように機能しますか？",
    "神経可塑性とは何ですか？",
    "ニューラルネットワークはどのように学習しますか？",
  ],
  ko: [
    "의식이란 무엇인가요?",
    "뇌는 음악을 어떻게 처리하나요?",
    "양자 컴퓨팅을 간단히 설명해주세요",
    "기억은 어떻게 작동하나요?",
    "신경 가소성이란 무엇인가요?",
    "신경망은 어떻게 학습하나요?",
  ],
};

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  rabbitHoles?: string[];
  nextQuestions?: string[];
}

export default function CuriosityOceanChat() {
  // Use safe Clerk hooks that work during SSR/build
  const [clerkData, setClerkData] = useState<{ userId: string | null; user: { firstName?: string | null; username?: string | null } | null }>({ userId: null, user: null });
  
  // Load Clerk data on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const auth = useAuthHook();
        const userData = useUserHook();
        setClerkData({ userId: auth.userId, user: userData.user || null });
      } catch {
        // Clerk not available
      }
    }
  }, []);
  
  const { userId, user } = clerkData;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [curiosityLevel, setCuriosityLevel] = useState<'curious' | 'wild' | 'chaos' | 'genius'>('curious');
  const [language, setLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const OCEAN_API = process.env.NEXT_PUBLIC_OCEAN_URL || 'http://localhost:8030';

  // Get current translations
  const t = translations[language] || translations.en;
  const suggestedQuestions = SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.en;

  // Helper to get auth headers
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (userId) {
      headers['X-Clerk-User-Id'] = userId;
    }
    return headers;
  }, [userId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Detect browser language on mount
  useEffect(() => {
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
  }, []);

  // Set welcome message when language changes
  useEffect(() => {
    const currentT = translations[language] || translations.en;
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: currentT.welcome,
      timestamp: new Date(),
    }]);
  }, [language]);

  // ============================================================================
  // 🎤 MICROPHONE - Voice Recording
  // ============================================================================
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            
            // Add user message
            setMessages(prev => [...prev, {
              id: `user-${Date.now()}`,
              type: 'user',
              content: '🎤 Duke dërguar audio...',
              timestamp: new Date(),
            }]);
            
            try {
              const res = await fetch('/api/ocean/audio', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ 
                  audio_base64: base64, 
                  language: language,
                  clerk_user_id: userId 
                })
              });
              const data = await res.json();
              
              setMessages(prev => [...prev, {
                id: `ai-${Date.now()}`,
                type: 'ai',
                content: `📝 Transkriptim: ${data.transcript || data.text || 'Audio u përpunua'}`,
                timestamp: new Date(),
              }]);
            } catch {
              setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                type: 'ai',
                content: '❌ Gabim në përpunimin e audios',
                timestamp: new Date(),
              }]);
            }
          };
          reader.readAsDataURL(blob);
          stream.getTracks().forEach(t => t.stop());
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
      } catch {
        alert('Qasja në mikrofon u refuzua');
      }
    }
  };

  // ============================================================================
  // 📷 CAMERA - Image Capture
  // ============================================================================
  const startCameraStream = async (mode: 'user' | 'environment') => {
    try {
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: mode } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert('Qasja në kamerë u refuzua');
      setShowCamera(false);
    }
  };

  const toggleCamera = async () => {
    if (showCamera) {
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      setShowCamera(false);
    } else {
      setShowCamera(true);
      setTimeout(() => startCameraStream(facingMode), 100);
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (showCamera) {
      await startCameraStream(newMode);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: '📷 Foto u kap...',
      timestamp: new Date(),
    }]);
    
    try {
      const res = await fetch('/api/ocean/vision', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          image_base64: base64, 
          prompt: language === 'sq' ? 'Përshkruaj këtë foto në shqip' : 'Describe this photo',
          clerk_user_id: userId
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `🔍 ${data.analysis || data.text_extracted || 'Analiza e imazhit...'}`,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '❌ Gabim në analizën e imazhit',
        timestamp: new Date(),
      }]);
    }
    
    toggleCamera();
  };

  // ============================================================================
  // 📄 DOCUMENT - File Upload
  // ============================================================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Dokumenti është shumë i madh (max 10MB)');
      return;
    }
    
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const isBinary = ['pdf', 'doc', 'docx'].includes(ext);
    
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: `📄 Dokument: ${file.name}`,
      timestamp: new Date(),
    }]);

    const sendDocument = async (content: string, encoding: string) => {
      try {
        const res = await fetch('/api/ocean/document', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            content,
            encoding,
            action: 'summarize',
            doc_type: ext,
            filename: file.name,
            clerk_user_id: userId
          })
        });
        const data = await res.json();
        
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `📋 ${data.analysis || data.summary || 'Dokumenti u analizua'}`,
          timestamp: new Date(),
        }]);
      } catch {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          type: 'ai',
          content: '❌ Gabim në përpunimin e dokumentit',
          timestamp: new Date(),
        }]);
      }
    };

    if (isBinary) {
      // PDF/DOC/DOCX → base64 encoding
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await sendDocument(base64, 'base64');
      };
      reader.readAsDataURL(file);
    } else {
      // TXT/MD/CSV/JSON → plain text
      const reader = new FileReader();
      reader.onloadend = async () => {
        await sendDocument(reader.result as string, 'text');
      };
      reader.readAsText(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Streaming message handler
  const sendStreamingMessage = async (messageText: string) => {
    const aiMessageId = `ai-${Date.now()}`;
    
    // Add empty AI message that will be populated via streaming
    setMessages(prev => [...prev, {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);
    
    setIsStreaming(true);
    
    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/ocean/stream', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          message: messageText, 
          language,
          clerk_user_id: userId,
          user_name: user?.firstName || user?.username
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Stream failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          
          // Update the message content in real-time
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullContent }
              : msg
          ));
          
          scrollToBottom();
        }
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: '🌊 Streaming interrupted. Please try again.', isStreaming: false }
            : msg
        ));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regular (non-streaming) message handler
  const sendRegularMessage = async (messageText: string) => {
    try {
      const res = await fetch('/api/ocean', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          question: messageText,
          curiosityLevel: curiosityLevel,
          clerk_user_id: userId,
          user_name: user?.firstName || user?.username,
          language: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseContent = data.response || data.persona_answer || 'No response received';

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: responseContent,
          timestamp: new Date(),
          nextQuestions: data.curiosity_threads || [],
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'ai',
          content: '🌊 The Orchestrator is thinking. Please try again or check if Ocean-Core is running on port 8030.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '🌊 Connection interrupted. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const sendMessage = async (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (useStreaming) {
        await sendStreamingMessage(messageText);
      } else {
        await sendRegularMessage(messageText);
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: t.chatCleared,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex flex-col">
      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-2 text-sm font-medium">
        {t.banner}
      </div>
      
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/modules" className="text-emerald-600 hover:text-emerald-500 text-sm">
                {t.modules}
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <Compass className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-xs text-gray-500">{t.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-gray-100 border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  title="Select language"
                >
                  <option value="en">🇬🇧 EN</option>
                  <option value="sq">🇦🇱 SQ</option>
                  <option value="de">🇩🇪 DE</option>
                  <option value="es">🇪🇸 ES</option>
                  <option value="fr">🇫🇷 FR</option>
                  <option value="it">🇮🇹 IT</option>
                  <option value="zh">🇨🇳 ZH</option>
                  <option value="ja">🇯🇵 JA</option>
                  <option value="ko">🇰🇷 KO</option>
                </select>
                <Globe className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Streaming Toggle */}
              <button
                onClick={() => setUseStreaming(!useStreaming)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  useStreaming 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
                title={useStreaming ? 'Streaming enabled' : 'Streaming disabled'}
              >
                <Zap className={`w-4 h-4 ${useStreaming ? 'text-emerald-600' : 'text-gray-400'}`} />
                {useStreaming ? t.streaming : t.normal}
              </button>

              <select
                value={curiosityLevel}
                onChange={(e) => setCuriosityLevel(e.target.value as 'curious' | 'wild' | 'chaos' | 'genius')}
                className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700"
              >
                <option value="curious">{t.curious}</option>
                <option value="wild">{t.wild}</option>
                <option value="chaos">{t.chaos}</option>
                <option value="genius">{t.genius}</option>
              </select>

              <button
                onClick={clearChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear chat"
              >
                <RefreshCw className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-white shadow-md text-black rounded-bl-md border border-gray-200'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium">{t.title}</span>
                    {message.isStreaming && (
                      <span className="text-xs text-emerald-500 animate-pulse">{t.streamingIndicator}</span>
                    )}
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Explore Further */}
                {message.rabbitHoles && message.rabbitHoles.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-emerald-600 mb-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      {t.exploreFurther}
                    </p>
                    <div className="space-y-1">
                      {message.rabbitHoles.map((hole, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(hole)}
                          className="block w-full text-left text-sm text-gray-900 hover:text-emerald-700 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 inline mr-1" />
                          {hole}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Questions */}
                {message.nextQuestions && message.nextQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-purple-600 mb-2">{t.continueWith}</p>
                    <div className="flex flex-wrap gap-2">
                      {message.nextQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(q)}
                          className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full px-3 py-1 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-600">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator - only show when not streaming */}
          {isLoading && !isStreaming && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md rounded-2xl rounded-bl-md p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Curiosity Ocean</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-gray-600">
                  <span className="text-sm">{t.thinking}</span>
                  <span className="inline-flex">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <p className="text-sm text-gray-900 font-medium mb-3">{t.tryAsking}</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="text-sm bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-full px-4 py-2 transition-colors border border-gray-300 shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Camera Preview */}
          {showCamera && (
            <div className="mb-4 flex justify-center">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <video ref={videoRef} autoPlay className="w-80 h-60 bg-black" />
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <button 
                    onClick={capturePhoto} 
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 shadow-lg"
                  >
                    <Camera className="w-4 h-4" /> Kap
                  </button>
                  <button 
                    onClick={switchCamera} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 shadow-lg"
                    title={facingMode === 'user' ? 'Kalo kamerën mbrapa' : 'Kalo kamerën para'}
                  >
                    🔄 {facingMode === 'user' ? 'Mbrapa' : 'Para'}
                  </button>
                  <button 
                    onClick={toggleCamera} 
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 shadow-lg"
                  >
                    <X className="w-4 h-4" /> Mbyll
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Multimodal Tools */}
            <div className="flex gap-1">
              <button
                onClick={toggleRecording}
                disabled={isLoading || isStreaming}
                className={`p-3 rounded-xl transition-all ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-emerald-600'
                }`}
                title="🎤 Mikrofon"
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleCamera}
                disabled={isLoading || isStreaming}
                className={`p-3 rounded-xl transition-all ${
                  showCamera 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-emerald-600'
                }`}
                title="📷 Kamera"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isStreaming}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-emerald-600 rounded-xl transition-all"
                title="📄 Dokument"
              >
                <FileText className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.md,.csv,.json"
              />
            </div>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.askAnything}
                className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                disabled={isLoading || isStreaming}
              />
              {isStreaming ? (
                <button
                  onClick={stopStreaming}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  title={t.stopButton}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
