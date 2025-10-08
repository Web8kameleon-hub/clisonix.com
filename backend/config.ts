export type AppConfig = {
  NODE_ENV: string; PORT: number;
  CORS_ORIGIN?: string | boolean;
  REDIS_URL?: string;
  DATABASE_URL?: string;
  SIGNAL_HTTP?: string;
  SIGNAL_REDIS_CHANNEL?: string;
  PYTHON?: string;                 // "python" ose "py -3" sipas OS
  MNE_SCRIPT?: string;             // p.sh. ./python/eeg_process.py
  LIBROSA_SCRIPT?: string;         // p.sh. ./python/audio_analyze.py
  MODBUS_HOST?: string; MODBUS_PORT?: number;
};

export function loadConfig(): AppConfig {
  return {
    NODE_ENV: process.env.NODE_ENV ?? "production",
    PORT: Number(process.env.PORT ?? 8000),
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? true,
    REDIS_URL: process.env.REDIS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    SIGNAL_HTTP: process.env.SIGNAL_HTTP,
    SIGNAL_REDIS_CHANNEL: process.env.SIGNAL_REDIS_CHANNEL ?? "signals:security",
    PYTHON: process.env.PYTHON ?? "python",
    MNE_SCRIPT: process.env.MNE_SCRIPT ?? "./python/eeg_process.py",
    LIBROSA_SCRIPT: process.env.LIBROSA_SCRIPT ?? "./python/audio_analyze.py",
    MODBUS_HOST: process.env.MODBUS_HOST,
    MODBUS_PORT: process.env.MODBUS_PORT ? Number(process.env.MODBUS_PORT) : undefined,
  };
}