import React, { useState } from 'react';
import { 
  CloudRain, 
  Waves, 
  Clock, 
  Play, 
  Pause, 
  Eye, 
  SlidersHorizontal,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { WeatherTelemetry } from '../types/flood';

interface SimulationControllerProps {
  weather: WeatherTelemetry;
  onChangeWeather: (updated: Partial<WeatherTelemetry>) => void;
  showRadar: boolean;
  setShowRadar: (val: boolean) => void;
  showWaterways: boolean;
  setShowWaterways: (val: boolean) => void;
  showCitizenReports: boolean;
  setShowCitizenReports: (val: boolean) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  lang: 'en' | 'mr';
}

export const SimulationController: React.FC<SimulationControllerProps> = ({
  weather,
  onChangeWeather,
  showRadar,
  setShowRadar,
  showWaterways,
  setShowWaterways,
  showCitizenReports,
  setShowCitizenReports,
  isSimulating,
  setIsSimulating,
  lang,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const applyPreset = (preset: 'july2026' | 'moderate' | 'peak') => {
    if (preset === 'july2026') {
      onChangeWeather({
        rainfallIntensityMmHr: 95,
        forecastNext3HrMmHr: 110,
        khadakwaslaDamDischargeCusecs: 28400,
        damStatus: 'flood_release',
        soilSaturationPercent: 96,
        timeHorizon: '+3h',
      });
    } else if (preset === 'moderate') {
      onChangeWeather({
        rainfallIntensityMmHr: 30,
        forecastNext3HrMmHr: 22,
        khadakwaslaDamDischargeCusecs: 14000,
        damStatus: 'alert_level',
        soilSaturationPercent: 70,
        timeHorizon: 'now',
      });
    } else if (preset === 'peak') {
      onChangeWeather({
        rainfallIntensityMmHr: 65,
        forecastNext3HrMmHr: 80,
        khadakwaslaDamDischargeCusecs: 35000,
        damStatus: 'danger_level',
        soilSaturationPercent: 88,
        timeHorizon: '+1h',
      });
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
      {/* Compact Top Bar: Scenario Chips + Forecast Horizon + Expand Sliders */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'mr' ? 'परिस्थिती:' : 'Scenario:'}</span>
          </span>
          <button
            type="button"
            onClick={() => applyPreset('moderate')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer text-[11px] ${
              weather.rainfallIntensityMmHr <= 35
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {lang === 'mr' ? 'सामान्य पाऊस (30mm)' : 'Moderate Rain (30mm)'}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('peak')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer text-[11px] ${
              weather.rainfallIntensityMmHr > 35 && weather.rainfallIntensityMmHr < 85
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-amber-300'
            }`}
          >
            {lang === 'mr' ? 'अतिवृष्टी (65mm)' : 'Heavy Surge (65mm)'}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('july2026')}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-colors cursor-pointer text-[11px] flex items-center gap-1 ${
              weather.rainfallIntensityMmHr >= 85
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-red-950/70 hover:bg-red-900 border-red-800 text-red-200'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>{lang === 'mr' ? 'जुलै २०२६ पूर (95mm)' : 'July 2026 Deluge (95mm)'}</span>
          </button>
        </div>

        {/* Time Horizon + Auto Play + Expand Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Clock className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
            {(['now', '+1h', '+3h', '+6h'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChangeWeather({ timeHorizon: t })}
                className={`px-2.5 py-1 rounded-lg font-mono-code font-bold text-[11px] transition-all cursor-pointer ${
                  weather.timeHorizon === t
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'now' ? (lang === 'mr' ? 'आता' : 'Now') : t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              isSimulating
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? (lang === 'mr' ? 'थांबवा' : 'Pause') : (lang === 'mr' ? 'सिम्युलेशन' : 'Simulate')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? (lang === 'mr' ? 'लपवा' : 'Less') : (lang === 'mr' ? 'पाऊस व थर' : 'Controls & Layers')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Sliders & Map Layers */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Rainfall Intensity Slider */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'mr' ? 'पावसाची तीव्रता' : 'Rainfall Intensity'}</span>
                </span>
                <span className="font-mono-code font-bold text-blue-400">
                  {weather.rainfallIntensityMmHr} mm/hr
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={weather.rainfallIntensityMmHr}
                onChange={(e) => onChangeWeather({ rainfallIntensityMmHr: parseInt(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono-code">
                <span>Drizzle (5mm)</span>
                <span>Cloudburst (120mm)</span>
              </div>
            </div>

            {/* Khadakwasla Dam Discharge Slider */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'mr' ? 'खडकवासला धरण विसर्ग' : 'Khadakwasla Dam Release'}</span>
                </span>
                <span className="font-mono-code font-bold text-cyan-400">
                  {weather.khadakwaslaDamDischargeCusecs.toLocaleString()} cusecs
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="50000"
                step="2000"
                value={weather.khadakwaslaDamDischargeCusecs}
                onChange={(e) => onChangeWeather({ khadakwaslaDamDischargeCusecs: parseInt(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono-code">
                <span>Safe (2k)</span>
                <span>Red Alert (50k)</span>
              </div>
            </div>
          </div>

          {/* Map Layer Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">
              {lang === 'mr' ? 'नकाशा थर:' : 'Map Layers:'}
            </span>
            <button
              type="button"
              onClick={() => setShowRadar(!showRadar)}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                showRadar
                  ? 'bg-blue-950 border-blue-700 text-blue-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              <span>{lang === 'mr' ? 'पाऊस रडार' : 'Rain Radar'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowWaterways(!showWaterways)}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                showWaterways
                  ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Waves className="w-3 h-3" />
              <span>{lang === 'mr' ? 'नद्या व नाले' : 'Rivers & Nullahs'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCitizenReports(!showCitizenReports)}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                showCitizenReports
                  ? 'bg-amber-950 border-amber-700 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{lang === 'mr' ? 'नागरिक फोटो' : 'Citizen Pins'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
