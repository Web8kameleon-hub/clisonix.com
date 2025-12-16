// EEG Analysis Data API Route
// Author: Ledjan Ahmati

import { NextResponse } from 'next/server'

export async function GET() {
  const now = Date.now()
  const eegSignal = Array.from({ length: 128 }, (_, i) => Math.sin(2 * Math.PI * 10 * (i / 128)) + Math.random() * 0.1)
  const detectedEvents = eegSignal
    .map((v, i) => ({ type: v > 0.9 ? 'spike' : '', time: i, value: v }))
    .filter(e => e.type)
  const data = {
    timestamp: now,
    analysisType: 'EEG Spike Detection',
    eegSignal,
    detectedEvents,
    status: 'success',
    metrics: {
      analysisTimeMs: 33,
      peak: Math.max(...eegSignal),
      mean: eegSignal.reduce((a, b) => a + b, 0) / eegSignal.length,
      eventCount: detectedEvents.length
    },
    log: [
      { event: 'start', timestamp: now - 3000, message: 'EEG analysis started.' },
      { event: 'analysis', timestamp: now - 200, message: 'EEG analysis complete.' }
    ],
    audit: {
      requestId: Math.floor(Math.random() * 1e9),
      receivedAt: new Date(now).toISOString(),
      clientIp: '127.0.0.1',
      userAgent: 'Industrial-Health-Agent/2.0'
    }
  }
  return NextResponse.json({ success: true, data })
}
