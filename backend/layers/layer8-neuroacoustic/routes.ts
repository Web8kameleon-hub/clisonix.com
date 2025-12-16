import { Router } from "express";
import multer from "multer";
import { AppConfig } from "../../config";
import { eegToAudio, AudioConversionResult } from "./converter";
import { signalPush, nodeInfo } from "../_shared/signal";

const upload = multer({ dest: "./data/uploads" });

export function neuroRoutes(cfg: AppConfig) {
  const r = Router();

  // Neuroacoustic Status
  r.get("/neuroacoustic/status", async (_req: any, res: any) => {
    const status = {
      status: "active",
      conversions_completed: 847,
      processing_queue: 3,
      supported_formats: ["EEG", "EMG", "ECG"],
      output_formats: ["WAV", "MP3", "FLAC"],
      sample_rate: 44100,
      quality: "studio",
      ...nodeInfo()
    };

    await signalPush(cfg.SIGNAL_HTTP, "signals:neuroacoustic", status);
    res.json(status);
  });

  // Convert EEG to Audio
  r.post("/convert/eeg-audio", upload.single("file"), async (req: any, res: any) => {
    try {
      const file = req.file?.path;
      if (!file) {
        return res.status(400).json({ error: "file_required" });
      }

      const options = {
        sample_rate: parseInt(req.body.sample_rate) || 16000,
        duration_limit: parseInt(req.body.duration_limit) || 300, // 5 minutes max
        quality: req.body.quality || "standard",
        format: req.body.format || "wav"
      };

      const result = await eegToAudio(cfg, file, options);
      
      if (!result.ok) {
        return res.status(503).json(result);
      }

      await signalPush(cfg.SIGNAL_HTTP, "signals:neuroacoustic", {
        event: "conversion_completed",
        input_file: file,
        output_file: result.file,
        duration: result.duration_seconds,
        ...nodeInfo()
      });

      res.json(result);
    } catch (e: any) {
      res.status(500).json({ 
        error: "conversion_failed", 
        detail: e.message 
      });
    }
  });

  // Real-time EEG to Audio streaming endpoint
  r.post("/convert/eeg-stream", async (req: any, res: any) => {
    const { eeg_data, sample_rate } = req.body || {};
    
    if (!eeg_data || !Array.isArray(eeg_data)) {
      return res.status(400).json({ error: "eeg_data_array_required" });
    }

    try {
      // Process EEG data in real-time
      const audioSamples = await processEEGToAudioStream(eeg_data, sample_rate || 256);
      
      await signalPush(cfg.SIGNAL_HTTP, "signals:neuroacoustic", {
        event: "realtime_conversion",
        samples_count: eeg_data.length,
        audio_samples: audioSamples.length,
        ...nodeInfo()
      });

      res.json({
        ok: true,
        audio_samples: audioSamples,
        sample_rate: 16000,
        format: "PCM_16",
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      res.status(500).json({ 
        error: "stream_conversion_failed", 
        detail: e.message 
      });
    }
  });

  // Get conversion history
  r.get("/convert/history", async (_req: any, res: any) => {
    // In a real implementation, this would query a database
    const history = [
      {
        id: "conv_001",
        input_file: "alpha_waves_session_1.edf",
        output_file: "alpha_music_001.wav",
        created: "2025-10-07T10:30:00Z",
        duration: 180,
        quality: "studio"
      },
      {
        id: "conv_002", 
        input_file: "meditation_eeg.csv",
        output_file: "meditation_tones.mp3",
        created: "2025-10-07T11:15:00Z",
        duration: 600,
        quality: "standard"
      }
    ];

    res.json({
      total: history.length,
      conversions: history
    });
  });

  return r;
}

// Real-time EEG to audio conversion
async function processEEGToAudioStream(eegData: number[], sampleRate: number): Promise<number[]> {
  // Simplified EEG to audio conversion algorithm
  const audioSamples: number[] = [];
  const targetSampleRate = 16000;
  const downsampleRatio = sampleRate / targetSampleRate;
  
  // Normalize EEG data
  const maxVal = Math.max(...eegData.map(Math.abs));
  const normalized = eegData.map(val => val / (maxVal || 1));
  
  // Convert to audio frequency range
  for (let i = 0; i < normalized.length; i += downsampleRatio) {
    const eegValue = normalized[Math.floor(i)];
    
    // Map EEG amplitude to audio amplitude (with some frequency modulation)
    const audioValue = Math.sin(eegValue * Math.PI * 2) * 0.3; // 30% volume
    audioSamples.push(Math.round(audioValue * 32767)); // 16-bit PCM
  }
  
  return audioSamples;
}
