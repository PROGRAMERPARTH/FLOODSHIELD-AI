import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  Bike, 
  Car, 
  Truck, 
  Footprints, 
  TrendingUp, 
  Droplets, 
  Layers, 
  Navigation, 
  Camera, 
  Radio,
  Loader2,
  Waves,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { RoadSegment, RiskLevel, WeatherTelemetry } from '../types/flood';

interface RoadDetailPanelProps {
  segment: RoadSegment | null;
  weather: WeatherTelemetry;
  onClose: () => void;
  onPlanRouteForSegment: (segment: RoadSegment) => void;
  onUploadForSegment: (segment: RoadSegment) => void;
  onAlertForSegment: (segment: RoadSegment) => void;
  lang: 'en' | 'mr';
}

interface CorridorPrediction {
  peakDepthCm: number;
  riskLevel: string;
  waterLevelCurve: { timeOffset: string; depthCm: number }[];
  drainageBottleneckPercent: number;
  civicActionRequired: string;
  citizenAdvisory: string;
}

export const RoadDetailPanel: React.FC<RoadDetailPanelProps> = ({
  segment,
  weather,
  onClose,
  onPlanRouteForSegment,
  onUploadForSegment,
  onAlertForSegment,
  lang,
}) => {
  const [aiPrediction, setAiPrediction] = useState<CorridorPrediction | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState<boolean>(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Reset AI briefing state when switching road segments
  useEffect(() => {
    setAiPrediction(null);
    setPredictionError(null);
    setIsLoadingPrediction(false);
  }, [segment?.id]);

  // Deterministic hydrological runoff progression curve (zero API quota usage on segment selection)
  const localHydrologyPrediction = useMemo<CorridorPrediction | null>(() => {
    if (!segment) return null;

    const nowDepth = segment.currentWaterDepthCm;
    const h1Depth = Math.max(1, Math.round(nowDepth * 1.25));
    const h3Depth = Math.max(nowDepth, Math.round(nowDepth * 1.55));
    const h6Depth = Math.max(2, Math.round(h3Depth * 0.45));

    const bottleneck =
      segment.drainageCulvertStatus === 'overflowing'
        ? 92
        : segment.drainageCulvertStatus === 'severely_clogged'
        ? 84
        : segment.drainageCulvertStatus === 'partially_silted'
        ? 56
        : 18;

    return {
      peakDepthCm: h3Depth,
      riskLevel: h3Depth >= 45 ? 'Severe' : h3Depth >= 25 ? 'High' : h3Depth >= 10 ? 'Moderate' : 'Low',
      waterLevelCurve: [
        { timeOffset: '0h (Now)', depthCm: nowDepth },
        { timeOffset: '+1h', depthCm: h1Depth },
        { timeOffset: '+3h (Peak)', depthCm: h3Depth },
        { timeOffset: '+6h', depthCm: h6Depth },
      ],
      drainageBottleneckPercent: bottleneck,
      civicActionRequired:
        segment.proximityToWaterbodyM < 100
          ? 'Deploy 50 HP dewatering suction pumps at culvert chokepoint and barricade underpass entry.'
          : 'Inspect storm drain catch basins for plastic debris clogging.',
      citizenAdvisory:
        h3Depth > 25
          ? 'Avoid this corridor during peak downpour. High probability of low-slung vehicle engine failure.'
          : 'Passable with caution. Watch for concealed potholes.',
    };
  }, [segment]);

  const handleRequestAiBriefing = async () => {
    if (!segment) return;
    setIsLoadingPrediction(true);
    setPredictionError(null);

    try {
      const response = await fetch('/api/gemini/predict-corridor-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentName: segment.name,
          currentRainMm: weather.rainfallIntensityMmHr,
          forecastRainMm: weather.forecastNext3HrMmHr,
          elevationMeters: segment.elevationMeters,
          proximityToRiverMeters: segment.proximityToWaterbodyM,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.prediction) {
        throw new Error(data.error || 'Failed to generate AI hydrological briefing.');
      }

      setAiPrediction(data.prediction);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to fetch AI forecast right now.';
      setPredictionError(message);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  if (!segment) return null;

  const activePrediction = aiPrediction || localHydrologyPrediction;

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'safe':
        return { label: 'Safe Corridor', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'warning':
        return { label: 'Caution Required', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'severe':
        return { label: 'Severe Inundation', color: 'bg-rose-950 text-rose-300 border-rose-800' };
      case 'impassable':
        return { label: 'ROAD CLOSED / IMPASSABLE', color: 'bg-red-950 text-red-300 border-red-800' };
    }
  };

  const badge = getRiskBadge(segment.riskLevel);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between h-full max-h-[640px] overflow-y-auto">
      <div>
        {/* Back to Corridors bar */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'सर्व रस्ते पहा' : 'Back to All Corridors'}</span>
          </button>
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Road Title */}
        <div className="pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-base text-white leading-tight">
            {lang === 'mr' ? segment.nameMarathi : segment.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'mr' ? segment.wardMarathi : segment.ward} · {segment.proximityToWaterbodyM}m from {segment.waterbodyName}
          </p>
        </div>

      {/* Main Depth & Elevation Metrics */}
      <div className="grid grid-cols-2 gap-2.5 my-3.5">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>{lang === 'mr' ? 'पाण्याची खोली' : 'Waterlogging Depth'}</span>
            </div>
            <div className="font-mono-code font-black text-2xl text-cyan-300">
              {segment.currentWaterDepthCm} <span className="text-xs font-normal text-slate-400">cm</span>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400 font-mono-code">
            ~{(segment.currentWaterDepthCm / 2.54).toFixed(1)} inches
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>{lang === 'mr' ? 'समुद्रसपाटीपासून उंची' : 'Elevation (MSL)'}</span>
            </div>
            <div className="font-mono-code font-black text-2xl text-emerald-300">
              {segment.elevationMeters} <span className="text-xs font-normal text-slate-400">m</span>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400 capitalize">
            {segment.baseElevationCategory}
          </div>
        </div>
      </div>

      {/* July 2026 Historical Benchmark Callout */}
      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs mb-3.5">
        <div className="font-bold text-blue-300 flex items-center gap-1.5 mb-1">
          <Waves className="w-3.5 h-3.5 text-blue-400" />
          <span>{lang === 'mr' ? 'जुलै २०२६ पुणे अतिवृष्टी तुलना:' : 'July 2026 Extreme Downpour Benchmark:'}</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {lang === 'mr'
            ? `जुलै २०२६ च्या मुसळधार पावसात येथे ${segment.historicalJuly2026PeakDepthCm} सेमी पाणी साचले होते. तब्बल ${segment.activeComplaintsCount} नागरिकांनी महापालिकेकडे तक्रार नोंदवली होती.`
            : `Recorded peak inundation of ${segment.historicalJuly2026PeakDepthCm}cm during the July 2026 deluge, logging ${segment.activeComplaintsCount} civic distress calls.`}
        </p>
      </div>

      {/* Vehicle Accessibility Matrix */}
      <div className="mb-3.5">
        <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
          {lang === 'mr' ? 'वाहन प्रवेशक्षमता (Vehicle Passability):' : 'Vehicle Accessibility:'}
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
          <div className={`p-2 rounded-lg border ${
            segment.vehicleAccessibility.twoWheeler
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}>
            <Bike className="w-4 h-4 mx-auto mb-1" />
            <div className="text-[10px] font-bold">2-Wheel</div>
            <div className="text-[9px] uppercase">{segment.vehicleAccessibility.twoWheeler ? 'Pass' : 'Stop'}</div>
          </div>

          <div className={`p-2 rounded-lg border ${
            segment.vehicleAccessibility.hatchback
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}>
            <Car className="w-4 h-4 mx-auto mb-1" />
            <div className="text-[10px] font-bold">Sedan</div>
            <div className="text-[9px] uppercase">{segment.vehicleAccessibility.hatchback ? 'Pass' : 'Stop'}</div>
          </div>

          <div className={`p-2 rounded-lg border ${
            segment.vehicleAccessibility.suv
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-amber-950/60 border-amber-800 text-amber-300'
          }`}>
            <Truck className="w-4 h-4 mx-auto mb-1" />
            <div className="text-[10px] font-bold">SUV/Bus</div>
            <div className="text-[9px] uppercase">{segment.vehicleAccessibility.suv ? 'Pass' : 'Caution'}</div>
          </div>

          <div className={`p-2 rounded-lg border ${
            segment.vehicleAccessibility.pedestrian
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}>
            <Footprints className="w-4 h-4 mx-auto mb-1" />
            <div className="text-[10px] font-bold">Walk</div>
            <div className="text-[9px] uppercase">{segment.vehicleAccessibility.pedestrian ? 'Pass' : 'Danger'}</div>
          </div>
        </div>
      </div>

      {/* Identified Street Hazards */}
      <div className="mb-3.5">
        <div className="text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1 text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'सध्याचे धोके (Active Hazards):' : 'Identified Street Hazards:'}</span>
        </div>
        <ul className="space-y-1 text-[11px] text-slate-300 pl-2">
          {(lang === 'mr' ? segment.hazardsMarathi : segment.hazards).map((h, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-red-400 font-bold">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Predictive Time Horizon Chart & On-Demand AI Forecast */}
      {activePrediction && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1 text-cyan-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'पुढील वेळेचा अंदाज (Predictive Curve):' : 'Predictive Inundation Forecast:'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono-code">
              Bottleneck: {activePrediction.drainageBottleneckPercent}%
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-center font-mono-code text-[11px]">
            {activePrediction.waterLevelCurve.map((point, idx) => (
              <div key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[9px] text-slate-400">{point.timeOffset}</div>
                <div className="font-bold text-cyan-300 mt-0.5">{point.depthCm}cm</div>
              </div>
            ))}
          </div>

          {aiPrediction && (
            <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
              <div className="text-cyan-300 font-semibold">AI Civic Action:</div>
              <p className="text-slate-300">{aiPrediction.civicActionRequired}</p>
              <p className="text-amber-300">{aiPrediction.citizenAdvisory}</p>
            </div>
          )}

          {predictionError && (
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/80 text-[11px] text-red-300">
              {predictionError}
            </div>
          )}

          {!aiPrediction && (
            <button
              type="button"
              onClick={handleRequestAiBriefing}
              disabled={isLoadingPrediction}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-800/70 text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoadingPrediction ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'mr' ? 'AI विश्लेषण सुरू आहे...' : 'Running Gemini Hydrological Briefing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'mr' ? 'AI सखोल पूर विश्लेषण मिळवा' : 'Generate AI Hydrological Briefing'}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
        <button
          onClick={() => onPlanRouteForSegment(segment)}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors shadow"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'सुरक्षित मार्ग' : 'Safe Route'}</span>
        </button>

        <button
          onClick={() => onUploadForSegment(segment)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 font-semibold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'mr' ? 'फोटो पाठवा' : 'Report Photo'}</span>
        </button>

        <button
          onClick={() => onAlertForSegment(segment)}
          className="p-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-semibold text-[11px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'मराठी सूचना' : 'Broadcast'}</span>
        </button>
      </div>
      </div>
    </div>
  );
};
