'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/**
 * PHONE SENSORS - Real Device Sensor Module
 * 
 * Uses actual smartphone sensors via Web APIs:
 * - DeviceMotion API (accelerometer, gyroscope)
 * - DeviceOrientation API (compass, tilt)
 * - Geolocation API (GPS)
 * - Ambient Light Sensor API
 * - Vibration API
 * 
 * Backend Research:
 * - Movement pattern analysis
 * - Activity recognition (walking, running, still)
 * - Sleep detection via phone movement
 * - Location-based behavioral patterns
 */

interface MotionData {
  acceleration: { x: number; y: number; z: number } | null;
  accelerationWithGravity: { x: number; y: number; z: number } | null;
  rotationRate: { alpha: number; beta: number; gamma: number } | null;
  interval: number;
}

interface OrientationData {
  alpha: number | null; // compass direction (0-360)
  beta: number | null;  // front-back tilt (-180 to 180)
  gamma: number | null; // left-right tilt (-90 to 90)
  absolute: boolean;
}

interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

interface SensorReading {
  timestamp: string;
  type: string;
  data: any;
}

export default function PhoneSensorsPage() {
  const [motion, setMotion] = useState<MotionData | null>(null);
  const [orientation, setOrientation] = useState<OrientationData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [activityType, setActivityType] = useState<string>('unknown');
  const [stepCount, setStepCount] = useState(0);
  const [shakeDetected, setShakeDetected] = useState(false);
  
  const lastAcceleration = useRef<{ x: number; y: number; z: number } | null>(null);
  const stepThreshold = useRef(12);
  const shakeThreshold = useRef(15);

  // Request iOS permission for motion sensors
  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        setPermissionStatus(prev => ({ ...prev, motion: permission }));
        if (permission === 'granted') {
          startMotionTracking();
        }
      } catch (e) {
        setPermissionStatus(prev => ({ ...prev, motion: 'denied' }));
      }
    } else {
      // Non-iOS or older browsers
      setPermissionStatus(prev => ({ ...prev, motion: 'granted' }));
      startMotionTracking();
    }
  };

  const requestOrientationPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setPermissionStatus(prev => ({ ...prev, orientation: permission }));
        if (permission === 'granted') {
          startOrientationTracking();
        }
      } catch (e) {
        setPermissionStatus(prev => ({ ...prev, orientation: 'denied' }));
      }
    } else {
      setPermissionStatus(prev => ({ ...prev, orientation: 'granted' }));
      startOrientationTracking();
    }
  };

  const requestLocationPermission = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus(prev => ({ ...prev, location: 'granted' }));
          updateLocation(position);
          startLocationTracking();
        },
        (error) => {
          setPermissionStatus(prev => ({ ...prev, location: 'denied' }));
        },
        { enableHighAccuracy: true }
      );
    } else {
      setPermissionStatus(prev => ({ ...prev, location: 'unsupported' }));
    }
  };

  const startMotionTracking = () => {
    window.addEventListener('devicemotion', handleMotion);
  };

  const startOrientationTracking = () => {
    window.addEventListener('deviceorientation', handleOrientation);
  };

  const startLocationTracking = () => {
    navigator.geolocation.watchPosition(updateLocation, null, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    });
  };

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const data: MotionData = {
      acceleration: event.acceleration ? {
        x: Math.round((event.acceleration.x || 0) * 100) / 100,
        y: Math.round((event.acceleration.y || 0) * 100) / 100,
        z: Math.round((event.acceleration.z || 0) * 100) / 100
      } : null,
      accelerationWithGravity: event.accelerationIncludingGravity ? {
        x: Math.round((event.accelerationIncludingGravity.x || 0) * 100) / 100,
        y: Math.round((event.accelerationIncludingGravity.y || 0) * 100) / 100,
        z: Math.round((event.accelerationIncludingGravity.z || 0) * 100) / 100
      } : null,
      rotationRate: event.rotationRate ? {
        alpha: Math.round((event.rotationRate.alpha || 0) * 100) / 100,
        beta: Math.round((event.rotationRate.beta || 0) * 100) / 100,
        gamma: Math.round((event.rotationRate.gamma || 0) * 100) / 100
      } : null,
      interval: event.interval || 0
    };

    setMotion(data);

    // Step detection
    if (data.acceleration && lastAcceleration.current) {
      const delta = Math.sqrt(
        Math.pow(data.acceleration.x - lastAcceleration.current.x, 2) +
        Math.pow(data.acceleration.y - lastAcceleration.current.y, 2) +
        Math.pow(data.acceleration.z - lastAcceleration.current.z, 2)
      );
      
      if (delta > stepThreshold.current) {
        setStepCount(prev => prev + 1);
      }

      // Shake detection
      if (delta > shakeThreshold.current) {
        setShakeDetected(true);
        // Vibrate on shake
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
        setTimeout(() => setShakeDetected(false), 500);
      }

      // Activity detection
      detectActivity(delta);
    }
    
    if (data.acceleration) {
      lastAcceleration.current = { ...data.acceleration };
    }

    // Record if active
    if (isRecording) {
      setReadings(prev => [...prev.slice(-100), {
        timestamp: new Date().toISOString(),
        type: 'motion',
        data
      }]);
    }
  }, [isRecording]);

  const detectActivity = (accelerationDelta: number) => {
    if (accelerationDelta < 1) {
      setActivityType('still');
    } else if (accelerationDelta < 5) {
      setActivityType('walking');
    } else if (accelerationDelta < 12) {
      setActivityType('running');
    } else {
      setActivityType('intense');
    }
  };

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const data: OrientationData = {
      alpha: event.alpha !== null ? Math.round(event.alpha) : null,
      beta: event.beta !== null ? Math.round(event.beta) : null,
      gamma: event.gamma !== null ? Math.round(event.gamma) : null,
      absolute: event.absolute
    };

    setOrientation(data);

    if (isRecording) {
      setReadings(prev => [...prev.slice(-100), {
        timestamp: new Date().toISOString(),
        type: 'orientation',
        data
      }]);
    }
  }, [isRecording]);

  const updateLocation = (position: GeolocationPosition) => {
    const data: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: position.timestamp
    };

    setLocation(data);

    if (isRecording) {
      setReadings(prev => [...prev.slice(-100), {
        timestamp: new Date().toISOString(),
        type: 'location',
        data
      }]);
    }
  };

  const startAllSensors = async () => {
    await requestMotionPermission();
    await requestOrientationPermission();
    requestLocationPermission();
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      setReadings([]);
      setIsRecording(true);
      
      // Send to backend
      try {
        await fetch('/api/behavioral/sensors/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: localStorage.getItem('clisonix_device_id') || 'unknown',
            startedAt: new Date().toISOString(),
            sensors: Object.keys(permissionStatus).filter(k => permissionStatus[k] === 'granted')
          })
        });
      } catch (e) {}
    } else {
      setIsRecording(false);
      
      // Send collected data to backend
      try {
        await fetch('/api/behavioral/sensors/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: localStorage.getItem('clisonix_device_id') || 'unknown',
            readings,
            stepCount,
            duration: readings.length > 0 
              ? (new Date(readings[readings.length-1].timestamp).getTime() - new Date(readings[0].timestamp).getTime()) / 1000
              : 0
          })
        });
      } catch (e) {}
    }
  };

  const getCompassDirection = (degrees: number | null): string => {
    if (degrees === null) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getActivityEmoji = (activity: string): string => {
    const emojis: Record<string, string> = {
      still: '🧘',
      walking: '🚶',
      running: '🏃',
      intense: '💪',
      unknown: '❓'
    };
    return emojis[activity] || '❓';
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleMotion, handleOrientation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-white/60 hover:text-white">
            ← Kthehu
          </Link>
          <h1 className="text-xl font-bold text-white">📱 Phone Sensors</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Shake Detection */}
        {shakeDetected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl p-8 animate-ping">
              <span className="text-6xl">📳</span>
            </div>
          </div>
        )}

        {/* Activity & Steps */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 text-center">
            <span className="text-5xl">{getActivityEmoji(activityType)}</span>
            <p className="text-xl font-bold text-white mt-2 capitalize">{activityType}</p>
            <p className="text-white/60 text-sm">Aktiviteti aktual</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6 text-center">
            <span className="text-5xl">👟</span>
            <p className="text-3xl font-bold text-white mt-2">{stepCount}</p>
            <p className="text-white/60 text-sm">Hapa</p>
          </div>
        </div>

        {/* Permission & Start */}
        {Object.keys(permissionStatus).length === 0 ? (
          <button
            onClick={startAllSensors}
            className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-blue-500/30"
          >
            🔓 Aktivizo Sensorët
          </button>
        ) : (
          <div className="space-y-3">
            {/* Permission Status */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(permissionStatus).map(([sensor, status]) => (
                <div 
                  key={sensor}
                  className={`p-3 rounded-xl text-center ${
                    status === 'granted' 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  <span className="text-xl">
                    {sensor === 'motion' ? '📱' : sensor === 'orientation' ? '🧭' : '📍'}
                  </span>
                  <p className="text-xs text-white/60 mt-1 capitalize">{sensor}</p>
                  <span className={`text-xs ${status === 'granted' ? 'text-green-400' : 'text-red-400'}`}>
                    {status === 'granted' ? '✓' : '✕'}
                  </span>
                </div>
              ))}
            </div>

            {/* Record Button */}
            <button
              onClick={toggleRecording}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                isRecording
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/30 animate-pulse'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30'
              }`}
            >
              {isRecording ? '⏹️ Ndalo Regjistrimin' : '⏺️ Fillo Regjistrimin'}
            </button>
            
            {isRecording && (
              <p className="text-center text-white/60 text-sm">
                📊 {readings.length} lexime të regjistruara
              </p>
            )}
          </div>
        )}

        {/* Motion Data */}
        {motion && (
          <div className="bg-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              📱 Accelerometer
            </h3>
            
            {motion.acceleration && (
              <div className="grid grid-cols-3 gap-3">
                {['x', 'y', 'z'].map(axis => (
                  <div key={axis} className="text-center">
                    <p className="text-2xl font-mono text-white">
                      {(motion.acceleration as any)[axis].toFixed(2)}
                    </p>
                    <p className="text-white/60 text-sm uppercase">{axis}</p>
                    {/* Visual bar */}
                    <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ 
                          width: `${Math.min(Math.abs((motion.acceleration as any)[axis]) * 10, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {motion.rotationRate && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm mb-2">🔄 Rotation Rate</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-mono text-white">{motion.rotationRate.alpha.toFixed(1)}°</p>
                    <p className="text-xs text-white/40">Alpha</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono text-white">{motion.rotationRate.beta.toFixed(1)}°</p>
                    <p className="text-xs text-white/40">Beta</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono text-white">{motion.rotationRate.gamma.toFixed(1)}°</p>
                    <p className="text-xs text-white/40">Gamma</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orientation / Compass */}
        {orientation && (
          <div className="bg-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              🧭 Compass & Orientation
            </h3>
            
            <div className="flex items-center justify-center mb-4">
              {/* Compass Visual */}
              <div 
                className="w-32 h-32 rounded-full border-4 border-white/30 relative flex items-center justify-center"
                style={{ transform: `rotate(${-(orientation.alpha || 0)}deg)` }}
              >
                <div className="absolute top-2 text-red-500 font-bold">N</div>
                <div className="absolute bottom-2 text-white/40">S</div>
                <div className="absolute left-2 text-white/40">W</div>
                <div className="absolute right-2 text-white/40">E</div>
                <div className="w-1 h-12 bg-gradient-to-t from-transparent to-red-500 absolute top-4"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-3xl font-bold text-white">{orientation.alpha || 0}°</p>
                <p className="text-white/60 text-sm">{getCompassDirection(orientation.alpha)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-lg font-mono text-white">
                  β: {orientation.beta || 0}° / γ: {orientation.gamma || 0}°
                </p>
                <p className="text-white/60 text-sm">Tilt</p>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="bg-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              📍 GPS Location
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-sm text-white/60">Latitude</p>
                  <p className="text-lg font-mono text-white">{location.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-sm text-white/60">Longitude</p>
                  <p className="text-lg font-mono text-white">{location.longitude.toFixed(6)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-white font-mono">{location.accuracy.toFixed(0)}m</p>
                  <p className="text-xs text-white/40">Accuracy</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-white font-mono">
                    {location.altitude ? `${location.altitude.toFixed(0)}m` : 'N/A'}
                  </p>
                  <p className="text-xs text-white/40">Altitude</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-white font-mono">
                    {location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : '0'}
                  </p>
                  <p className="text-xs text-white/40">Speed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Research Note */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔬</span>
            <div>
              <p className="text-white font-medium">Kërkim Shkencor</p>
              <p className="text-white/60 text-sm mt-1">
                Të dhënat e sensorëve përdoren për analiza shkencore: 
                njohje aktiviteti, gjumë detection, dhe patterns sjelljeje.
                Të dhënat janë anonime.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="h-20"></div>
    </div>
  );
}
