'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * DYNAMIC FAVICON - Narrative Icon Based on User Behavior
 * 
 * The favicon changes based on:
 * - Time of day (morning/afternoon/evening/night)
 * - User activity (idle, active, focused)
 * - Page context (dashboard, analytics, mood, etc.)
 * - System status (online, offline, loading)
 * - User mood (if tracked)
 * 
 * This creates a living, breathing brand experience!
 */

type FaviconState = 
  | 'default'      // 🧠 Standard brain
  | 'thinking'     // 🧠💭 Processing/loading
  | 'happy'        // 🧠😊 Positive mood detected
  | 'focused'      // 🧠🎯 User is focused (low mouse movement)
  | 'sleeping'     // 🧠😴 User idle for long time
  | 'night'        // 🧠🌙 Night mode
  | 'morning'      // 🧠☀️ Morning energy
  | 'alert'        // 🧠⚠️ Notification/alert
  | 'success'      // 🧠✅ Task completed
  | 'offline'      // 🧠📴 No internet
  | 'analyzing';   // 🧠📊 Data analysis mode

interface FaviconColors {
  brain: string;
  pulse: string;
  background: string;
  glow?: string;
}

const STATE_COLORS: Record<FaviconState, FaviconColors> = {
  default:   { brain: '#2563eb', pulse: '#60a5fa', background: '#f8fafc' },
  thinking:  { brain: '#8b5cf6', pulse: '#a78bfa', background: '#f5f3ff', glow: '#c4b5fd' },
  happy:     { brain: '#10b981', pulse: '#34d399', background: '#ecfdf5', glow: '#6ee7b7' },
  focused:   { brain: '#f59e0b', pulse: '#fbbf24', background: '#fffbeb', glow: '#fcd34d' },
  sleeping:  { brain: '#64748b', pulse: '#94a3b8', background: '#f1f5f9' },
  night:     { brain: '#6366f1', pulse: '#818cf8', background: '#1e1b4b', glow: '#a5b4fc' },
  morning:   { brain: '#f97316', pulse: '#fb923c', background: '#fff7ed', glow: '#fdba74' },
  alert:     { brain: '#ef4444', pulse: '#f87171', background: '#fef2f2', glow: '#fca5a5' },
  success:   { brain: '#22c55e', pulse: '#4ade80', background: '#f0fdf4', glow: '#86efac' },
  offline:   { brain: '#6b7280', pulse: '#9ca3af', background: '#f3f4f6' },
  analyzing: { brain: '#0ea5e9', pulse: '#38bdf8', background: '#f0f9ff', glow: '#7dd3fc' },
};

export function DynamicFavicon() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const mouseMovementRef = useRef<number>(0);
  const currentStateRef = useRef<FaviconState>('default');
  const animationFrameRef = useRef<number>(0);
  const pulsePhaseRef = useRef<number>(0);

  // Determine state based on time of day
  const getTimeBasedState = useCallback((): FaviconState => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return 'morning';
    if (hour >= 22 || hour < 5) return 'night';
    return 'default';
  }, []);

  // Determine state based on user activity
  const getActivityState = useCallback((): FaviconState => {
    const now = Date.now();
    const idleTime = now - lastActivityRef.current;
    
    // Idle for more than 5 minutes = sleeping
    if (idleTime > 5 * 60 * 1000) return 'sleeping';
    
    // Low mouse movement in last 30 seconds = focused
    if (mouseMovementRef.current < 50 && idleTime < 30000) return 'focused';
    
    return getTimeBasedState();
  }, [getTimeBasedState]);

  // Draw the brain favicon
  const drawFavicon = useCallback((state: FaviconState, pulse: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 64;
    canvas.width = size;
    canvas.height = size;
    
    const colors = STATE_COLORS[state];
    const pulseIntensity = Math.sin(pulse) * 0.5 + 0.5;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Background with optional glow
    ctx.fillStyle = colors.background;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect for active states
    if (colors.glow) {
      const gradient = ctx.createRadialGradient(
        size/2, size/2, size/4,
        size/2, size/2, size/2
      );
      gradient.addColorStop(0, colors.glow + Math.floor(pulseIntensity * 80).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw brain shape (simplified)
    ctx.save();
    ctx.translate(size/2, size/2);
    ctx.scale(0.7, 0.7);
    
    // Brain outline
    ctx.fillStyle = colors.brain;
    ctx.beginPath();
    
    // Left hemisphere
    ctx.moveTo(-20, 0);
    ctx.bezierCurveTo(-25, -15, -20, -25, -10, -25);
    ctx.bezierCurveTo(-5, -28, 0, -25, 0, -20);
    
    // Right hemisphere
    ctx.bezierCurveTo(0, -25, 5, -28, 10, -25);
    ctx.bezierCurveTo(20, -25, 25, -15, 20, 0);
    
    // Bottom curves
    ctx.bezierCurveTo(25, 10, 20, 20, 10, 22);
    ctx.bezierCurveTo(5, 25, -5, 25, -10, 22);
    ctx.bezierCurveTo(-20, 20, -25, 10, -20, 0);
    
    ctx.fill();

    // Brain folds/details
    ctx.strokeStyle = colors.background;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Left side folds
    ctx.beginPath();
    ctx.moveTo(-18, -5);
    ctx.quadraticCurveTo(-10, -8, -5, -5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-15, 5);
    ctx.quadraticCurveTo(-8, 2, -3, 5);
    ctx.stroke();
    
    // Right side folds
    ctx.beginPath();
    ctx.moveTo(18, -5);
    ctx.quadraticCurveTo(10, -8, 5, -5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.quadraticCurveTo(8, 2, 3, 5);
    ctx.stroke();

    // Pulse line (EEG-style) - animated
    ctx.strokeStyle = colors.pulse;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    const waveOffset = pulse * 2;
    ctx.moveTo(-15, 12);
    ctx.lineTo(-8, 12);
    ctx.lineTo(-5, 12 - 8 * pulseIntensity);
    ctx.lineTo(-2, 12 + 6 * pulseIntensity);
    ctx.lineTo(2, 12 - 10 * pulseIntensity);
    ctx.lineTo(5, 12 + 4 * pulseIntensity);
    ctx.lineTo(8, 12);
    ctx.lineTo(15, 12);
    ctx.stroke();

    ctx.restore();

    // State indicator dot
    const indicatorColors: Partial<Record<FaviconState, string>> = {
      thinking: '#8b5cf6',
      happy: '#10b981',
      focused: '#f59e0b',
      sleeping: '#64748b',
      alert: '#ef4444',
      success: '#22c55e',
      offline: '#6b7280',
      analyzing: '#0ea5e9',
    };

    if (indicatorColors[state]) {
      ctx.fillStyle = indicatorColors[state]!;
      ctx.beginPath();
      ctx.arc(size - 10, size - 10, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Pulsing ring for active states
      if (['thinking', 'analyzing', 'alert'].includes(state)) {
        ctx.strokeStyle = indicatorColors[state]! + Math.floor((1 - pulseIntensity) * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size - 10, size - 10, 6 + pulseIntensity * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Update favicon
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') || 
                 document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
    
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(link);
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    pulsePhaseRef.current += 0.1;
    const newState = getActivityState();
    
    // Only redraw if state changed or for animated states
    if (newState !== currentStateRef.current || 
        ['thinking', 'analyzing', 'alert', 'focused'].includes(newState)) {
      currentStateRef.current = newState;
      drawFavicon(newState, pulsePhaseRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [getActivityState, drawFavicon]);

  // Track user activity
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const handleMouseMove = () => {
      mouseMovementRef.current++;
      lastActivityRef.current = Date.now();
    };

    // Reset mouse movement counter periodically
    const resetInterval = setInterval(() => {
      mouseMovementRef.current = 0;
    }, 10000);

    // Online/offline detection
    const handleOnline = () => {
      currentStateRef.current = 'success';
      drawFavicon('success', 0);
      setTimeout(() => {
        currentStateRef.current = getActivityState();
      }, 2000);
    };

    const handleOffline = () => {
      currentStateRef.current = 'offline';
      drawFavicon('offline', 0);
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check online status
    if (!navigator.onLine) {
      currentStateRef.current = 'offline';
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Initial draw
    drawFavicon(getActivityState(), 0);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(resetInterval);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animate, drawFavicon, getActivityState]);

  // Expose methods for external state changes
  useEffect(() => {
    // Global function to trigger favicon states from anywhere
    (window as any).setFaviconState = (state: FaviconState, duration?: number) => {
      currentStateRef.current = state;
      drawFavicon(state, pulsePhaseRef.current);
      
      if (duration) {
        setTimeout(() => {
          currentStateRef.current = getActivityState();
        }, duration);
      }
    };

    return () => {
      delete (window as any).setFaviconState;
    };
  }, [drawFavicon, getActivityState]);

  return null; // This component renders nothing visually
}

// Export utility functions
export const faviconStates = {
  thinking: () => (window as any).setFaviconState?.('thinking'),
  success: () => (window as any).setFaviconState?.('success', 3000),
  alert: () => (window as any).setFaviconState?.('alert'),
  analyzing: () => (window as any).setFaviconState?.('analyzing'),
  happy: () => (window as any).setFaviconState?.('happy', 5000),
};
