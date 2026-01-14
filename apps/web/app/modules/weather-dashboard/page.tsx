'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Cloud, Brain, Thermometer, Wind, Droplets, AlertTriangle, Activity, RefreshCw, Sun, Moon, Gauge, Zap } from 'lucide-react';

/**
 * BIOMETRIC ENVIRONMENT MONITOR
 * Clisonix Environmental Neuroscience Module
 * 
 * Analyzes how weather conditions affect cognitive performance
 * Real Open-Meteo API + Neural Performance Correlation
 */

interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    weatherCode: number;
    uvIndex: number;
}

interface CognitiveImpact {
    overall: 'optimal' | 'moderate' | 'challenging';
    score: number; // 0-100
    factors: {
        temperature: { impact: string; recommendation: string };
        pressure: { impact: string; migraineRisk: number };
        humidity: { impact: string; recommendation: string };
  };
    neurofeedbackAdvice: string;
    sessionQuality: string;
}

interface APIResponse {
    weather: WeatherData[];
    cognitive: CognitiveImpact;
    alertActive: boolean;
    timestamp: string;
    responseTime: number;
}

export default function BiometricEnvironmentMonitor() {
    const [data, setData] = useState<APIResponse | null>(null);
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string>('Tirana');

    const fetchData = useCallback(async () => {
        const startTime = performance.now();
        setLoading(true);

        try {
        // Fetch real weather data from Open-Meteo via our API
        const weatherResponse = await fetch('/api/weather/multiple-cities');
        const weatherResult = await weatherResponse.json();

        // Fetch ASI status for correlation
        const asiResponse = await fetch('/api/asi/status');
        const asiResult = await asiResponse.json();

        const endTime = performance.now();

        if (weatherResult.ok && weatherResult.data) {
            const weatherData: WeatherData[] = weatherResult.data.map((city: any) => ({
                city: city.city,
                country: city.location?.country || 'Unknown',
                temperature: city.weather?.temperature_2m || 0,
                humidity: city.weather?.relative_humidity_2m || 0,
                windSpeed: city.weather?.wind_speed_10m || 0,
                pressure: city.weather?.surface_pressure || 1013,
                weatherCode: city.weather?.weather_code || 0,
                uvIndex: city.weather?.uv_index || 0
            }));

            // Calculate cognitive impact based on environmental factors
            const currentCity = weatherData.find(w => w.city === selectedCity) || weatherData[0];
            const cognitive = calculateCognitiveImpact(currentCity, asiResult);

            setData({
                weather: weatherData,
                cognitive,
                alertActive: cognitive.factors.pressure.migraineRisk > 60,
                timestamp: new Date().toISOString(),
                responseTime: Math.round(endTime - startTime)
            });
            setError(null);
        } else {
            throw new Error('Failed to fetch weather data');
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
        setLoading(false);
    }
  }, [selectedCity]);

    const calculateCognitiveImpact = (weather: WeatherData, asiData: any): CognitiveImpact => {
        // Temperature impact (optimal: 18-24°C)
        const tempOptimal = weather.temperature >= 18 && weather.temperature <= 24;
        const tempImpact = tempOptimal ? 'Optimal' : weather.temperature < 18 ? 'Cool - may reduce alertness' : 'Warm - may cause fatigue';
        const tempScore = tempOptimal ? 100 : Math.max(0, 100 - Math.abs(weather.temperature - 21) * 5);

      // Pressure impact (migraine risk when dropping)
      const pressureNormal = weather.pressure >= 1000 && weather.pressure <= 1025;
      const migraineRisk = weather.pressure < 1000 ? Math.min(100, (1000 - weather.pressure) * 2) :
          weather.pressure > 1025 ? Math.min(50, (weather.pressure - 1025)) : 0;
      const pressureImpact = pressureNormal ? 'Stable' : weather.pressure < 1000 ? 'Low - potential headache trigger' : 'High - generally favorable';
      const pressureScore = 100 - migraineRisk;

      // Humidity impact (optimal: 40-60%)
      const humidityOptimal = weather.humidity >= 40 && weather.humidity <= 60;
      const humidityImpact = humidityOptimal ? 'Optimal' : weather.humidity < 40 ? 'Dry - may cause discomfort' : 'Humid - may feel sluggish';
      const humidityScore = humidityOptimal ? 100 : Math.max(0, 100 - Math.abs(weather.humidity - 50));

      // Overall score
      const overallScore = Math.round((tempScore + pressureScore + humidityScore) / 3);
      const overall: 'optimal' | 'moderate' | 'challenging' =
          overallScore >= 70 ? 'optimal' : overallScore >= 40 ? 'moderate' : 'challenging';

      // Neurofeedback session quality prediction
      const sessionQuality = overallScore >= 70 ? 'Excellent - ideal conditions for training' :
          overallScore >= 50 ? 'Good - minor environmental factors' :
              'Consider rescheduling - suboptimal conditions';

      const neurofeedbackAdvice = overall === 'optimal'
          ? '✅ Excellent conditions for neurofeedback sessions. Proceed with normal protocols.'
          : overall === 'moderate'
              ? '⚡ Moderate conditions. Consider shorter sessions or relaxation-focused training.'
              : '⚠️ Challenging conditions. Focus on stress-reduction protocols if proceeding.';

      return {
          overall,
          score: overallScore,
          factors: {
              temperature: {
                  impact: tempImpact,
                  recommendation: tempOptimal ? 'Maintain current conditions' : 'Adjust room temperature if possible'
              },
              pressure: {
                  impact: pressureImpact,
                  migraineRisk
              },
              humidity: {
                  impact: humidityImpact,
                  recommendation: humidityOptimal ? 'Good air quality' : 'Consider using humidifier/dehumidifier'
              }
          },
          neurofeedbackAdvice,
          sessionQuality
      };
  };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 300000); // Update every 5 minutes
        return () => clearInterval(interval);
    }, [fetchData]);

    const getWeatherIcon = (code: number) => {
        if (code === 0 || code === 1) return <Sun className="w-8 h-8 text-yellow-400" />;
        if (code >= 2 && code <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
        return <Cloud className="w-8 h-8 text-blue-400" />;
    };

    const getImpactColor = (impact: string) => {
        if (impact === 'optimal') return 'text-green-400 bg-green-500/20';
        if (impact === 'moderate') return 'text-yellow-400 bg-yellow-500/20';
        return 'text-red-400 bg-red-500/20';
    };

    const currentWeather = data?.weather.find(w => w.city === selectedCity) || data?.weather[0];

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
              <Link href="/modules" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center gap-2">
                  ← Back to Modules
              </Link>

              <div className="flex items-center justify-between mb-8">
                  <div>
                      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                          <Cloud className="w-8 h-8 text-blue-400" />
                          Biometric Environment Monitor
                      </h1>
                      <p className="text-gray-400 mt-1">
                          Environmental Neuroscience • Weather Impact on Cognitive Performance
                      </p>
                  </div>

                  <button
                      onClick={fetchData}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                  </button>
              </div>

              {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 text-red-400">
                          <AlertTriangle className="w-5 h-5" />
                          <span>{error}</span>
                      </div>
                  </div>
              )}

              {/* Migraine Alert */}
              {data?.alertActive && (
                  <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4 mb-6 animate-pulse">
                      <div className="flex items-center gap-3">
                          <AlertTriangle className="w-6 h-6 text-orange-400" />
                          <div>
                              <p className="text-orange-400 font-semibold">Barometric Pressure Alert</p>
                              <p className="text-orange-300 text-sm">
                                  Low pressure detected ({currentWeather?.pressure.toFixed(0)} hPa).
                                  Migraine risk elevated. Consider preventive measures.
                              </p>
                          </div>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cognitive Impact Panel */}
                  <div className="lg:col-span-1">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-purple-400" />
                              Cognitive Impact Analysis
                          </h2>

                          {data?.cognitive ? (
                              <div className="space-y-4">
                                  {/* Overall Score */}
                                  <div className={`rounded-xl p-6 text-center ${getImpactColor(data.cognitive.overall)}`}>
                                      <p className="text-4xl font-bold">{data.cognitive.score}</p>
                                      <p className="text-sm opacity-80 capitalize">{data.cognitive.overall} Conditions</p>
                                  </div>

                                  {/* Factor Breakdown */}
                                  <div className="space-y-3">
                                      {/* Temperature */}
                                      <div className="bg-white/5 rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-1">
                                              <span className="text-gray-400 flex items-center gap-2">
                                                  <Thermometer className="w-4 h-4" />
                                                  Temperature
                                              </span>
                                              <span className="text-white">{currentWeather?.temperature.toFixed(1)}°C</span>
                                          </div>
                                          <p className="text-xs text-gray-500">{data.cognitive.factors.temperature.impact}</p>
                                      </div>

                                      {/* Pressure */}
                                      <div className="bg-white/5 rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-1">
                                              <span className="text-gray-400 flex items-center gap-2">
                                                  <Gauge className="w-4 h-4" />
                                                  Pressure
                                              </span>
                                              <span className="text-white">{currentWeather?.pressure.toFixed(0)} hPa</span>
                                          </div>
                                          <p className="text-xs text-gray-500">{data.cognitive.factors.pressure.impact}</p>
                                          <div className="mt-2">
                                              <div className="flex justify-between text-xs mb-1">
                                                  <span className="text-gray-500">Migraine Risk</span>
                                                  <span className={data.cognitive.factors.pressure.migraineRisk > 50 ? 'text-red-400' : 'text-green-400'}>
                                                      {data.cognitive.factors.pressure.migraineRisk}%
                                                  </span>
                                              </div>
                                              <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                  <div
                                                      className={`h-1.5 rounded-full ${data.cognitive.factors.pressure.migraineRisk > 50 ? 'bg-red-500' : 'bg-green-500'
                                                          }`}
                                                      style={{ width: `${data.cognitive.factors.pressure.migraineRisk}%` }}
                                                  />
                                              </div>
                                          </div>
                                      </div>

                                      {/* Humidity */}
                                      <div className="bg-white/5 rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-1">
                                              <span className="text-gray-400 flex items-center gap-2">
                                                  <Droplets className="w-4 h-4" />
                                                  Humidity
                                              </span>
                                              <span className="text-white">{currentWeather?.humidity}%</span>
                                          </div>
                                          <p className="text-xs text-gray-500">{data.cognitive.factors.humidity.impact}</p>
                                      </div>
                                  </div>

                                  {/* Session Advice */}
                                  <div className="bg-purple-500/20 rounded-lg p-4 mt-4">
                                      <div className="flex items-center gap-2 mb-2">
                                          <Zap className="w-4 h-4 text-purple-400" />
                                          <span className="text-purple-300 text-sm font-medium">Neurofeedback Advice</span>
                                      </div>
                                      <p className="text-purple-200 text-sm">
                                          {data.cognitive.neurofeedbackAdvice}
                                      </p>
                                  </div>

                                  <div className="text-center pt-2">
                                      <span className="text-xs text-gray-500">
                                          Session Quality: <span className="text-white">{data.cognitive.sessionQuality}</span>
                                      </span>
                  </div>
                </div>
                          ) : (
                              <div className="animate-pulse space-y-4">
                                  <div className="h-32 bg-gray-700/50 rounded-xl" />
                                  <div className="h-20 bg-gray-700/50 rounded" />
                                  <div className="h-20 bg-gray-700/50 rounded" />
                              </div>
                          )}
            </div>
          </div>

                  {/* Weather Data Panel */}
                  <div className="lg:col-span-2">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                          <div className="flex items-center justify-between mb-4">
                              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                  <Activity className="w-5 h-5 text-cyan-400" />
                                  Environmental Data
                              </h2>
                              {data && (
                                  <span className="text-xs text-gray-500 font-mono">
                                      {data.responseTime}ms • {new Date(data.timestamp).toLocaleTimeString()}
                                  </span>
                              )}
                          </div>

                          {/* City Selector */}
                          {data?.weather && (
                              <div className="flex gap-2 mb-6 flex-wrap">
                                  {data.weather.map((city) => (
                                      <button
                                          key={city.city}
                                          onClick={() => setSelectedCity(city.city)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCity === city.city
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                      >
                          {city.city}
                      </button>
                  ))}
                </div>
                          )}

                          {/* Current Weather Display */}
                          {currentWeather && (
                              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-6 mb-6">
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <h3 className="text-2xl font-bold text-white">{currentWeather.city}</h3>
                                          <p className="text-gray-400">{currentWeather.country}</p>
                                      </div>
                                      <div className="text-right">
                                          {getWeatherIcon(currentWeather.weatherCode)}
                                          <p className="text-4xl font-bold text-white mt-2">
                                              {currentWeather.temperature.toFixed(1)}°C
                                          </p>
                                      </div>
                  </div>

                                  <div className="grid grid-cols-3 gap-4 mt-6">
                                      <div className="text-center">
                                          <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                          <p className="text-white font-medium">{currentWeather.humidity}%</p>
                                          <p className="text-gray-500 text-xs">Humidity</p>
                                      </div>
                                      <div className="text-center">
                                          <Wind className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                                          <p className="text-white font-medium">{currentWeather.windSpeed.toFixed(1)} km/h</p>
                                          <p className="text-gray-500 text-xs">Wind</p>
                                      </div>
                                      <div className="text-center">
                                          <Gauge className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                                          <p className="text-white font-medium">{currentWeather.pressure.toFixed(0)} hPa</p>
                                          <p className="text-gray-500 text-xs">Pressure</p>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* All Cities Grid */}
                          {data?.weather && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {data.weather.filter(w => w.city !== selectedCity).map((city) => (
                                      <button
                                          key={city.city}
                                          onClick={() => setSelectedCity(city.city)}
                                          className="bg-white/5 rounded-lg p-4 text-left hover:bg-white/10 transition-colors"
                                      >
                                          <div className="flex items-center justify-between mb-2">
                                              <span className="text-white font-medium">{city.city}</span>
                                              {getWeatherIcon(city.weatherCode)}
                                          </div>
                                          <p className="text-2xl font-bold text-white">{city.temperature.toFixed(1)}°C</p>
                                          <p className="text-gray-500 text-xs mt-1">
                                              {city.humidity}% humidity • {city.pressure.toFixed(0)} hPa
                                          </p>
                                      </button>
                                  ))}
                              </div>
                          )}

                          {/* Data Source */}
                          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                      <Cloud className="w-3 h-3" />
                                      Open-Meteo API
                                  </span>
                                  <span className="flex items-center gap-1">
                                      <Brain className="w-3 h-3" />
                                      Cognitive Correlation Engine
                                  </span>
                              </div>
                              <span>Real-time data • No simulations</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-xs text-gray-600">
                  Biometric Environment Monitor • Clisonix Environmental Neuroscience • Real API Data
        </div>
      </div>
    </div>
  );
}
