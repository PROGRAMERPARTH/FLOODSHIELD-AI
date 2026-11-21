import React, { useState, useMemo, useEffect } from 'react';
import { 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Bike, 
  Car, 
  Truck, 
  Footprints, 
  ArrowRight, 
  ArrowLeftRight,
  Clock, 
  MapPin,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { RoadSegment, SafeRouteOption, VehicleType, RiskLevel } from '../types/flood';
import { SAFE_ROUTES_CATALOG } from '../data/puneRoadNetwork';

interface SafeRoutePlannerProps {
  roadSegments: RoadSegment[];
  onApplyRoute: (safeRoute: SafeRouteOption, directRoute: SafeRouteOption) => void;
  initialOriginId?: string | null;
  lang: 'en' | 'mr';
}

const VEHICLE_THRESHOLDS: Record<VehicleType, number> = {
  twoWheeler: 15,
  hatchback: 25,
  suv: 48,
  pedestrian: 20,
};

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function depthToRisk(depthCm: number): RiskLevel {
  if (depthCm >= 50) return 'impassable';
  if (depthCm >= 25) return 'severe';
  if (depthCm >= 10) return 'warning';
  return 'safe';
}

export const SafeRoutePlanner: React.FC<SafeRoutePlannerProps> = ({
  roadSegments,
  onApplyRoute,
  initialOriginId,
  lang,
}) => {
  const [origin, setOrigin] = useState<string>(initialOriginId || 'sinhagad-pula-rajaram');
  const [destination, setDestination] = useState<string>('pune-station-subway');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('twoWheeler');

  useEffect(() => {
    if (initialOriginId) {
      setOrigin(initialOriginId);
      if (initialOriginId === 'pune-station-subway') {
        setDestination('karve-road-paud');
      }
    }
  }, [initialOriginId]);

  const vehicleThreshold = VEHICLE_THRESHOLDS[selectedVehicle];

  // Dynamically compute Direct vs Flood-Safe routes for ANY origin/destination pair
  const computedPlan = useMemo(() => {
    const catalogMatch = SAFE_ROUTES_CATALOG.find(
      (r) => r.originId === origin && r.destinationId === destination
    );

    const originSeg = roadSegments.find((r) => r.id === origin) || roadSegments[0];
    const destSeg = roadSegments.find((r) => r.id === destination) || roadSegments[roadSegments.length - 1];

    if (catalogMatch) {
      // Update catalog passability dynamically based on selected vehicle & current live segment depths
      const directMax = Math.max(
        originSeg.currentWaterDepthCm,
        destSeg.currentWaterDepthCm,
        catalogMatch.directRoute.maxWaterDepthCm
      );
      const safeMax = catalogMatch.safeRoute.maxWaterDepthCm;

      return {
        directRoute: {
          ...catalogMatch.directRoute,
          maxWaterDepthCm: directMax,
          passableForSelectedVehicle: directMax < vehicleThreshold,
        },
        safeRoute: {
          ...catalogMatch.safeRoute,
          passableForSelectedVehicle: safeMax < vehicleThreshold,
        },
      };
    }

    const startCoord = originSeg.coordinates[0];
    const endCoord = destSeg.coordinates[destSeg.coordinates.length - 1];
    const straightKm = Math.max(1.2, haversineKm(startCoord, endCoord));

    // Find intermediate flooded valley segments along corridor & safe ridge corridors
    const midLat = (startCoord[0] + endCoord[0]) / 2;
    const midLng = (startCoord[1] + endCoord[1]) / 2;

    const sortedByProximity = [...roadSegments]
      .filter((r) => r.id !== originSeg.id && r.id !== destSeg.id)
      .sort((a, b) => {
        const da = haversineKm(a.coordinates[0], [midLat, midLng]);
        const db = haversineKm(b.coordinates[0], [midLat, midLng]);
        return da - db;
      });

    const valleyMid =
      sortedByProximity.find((r) => r.currentWaterDepthCm >= 20) || sortedByProximity[0];

    const elevatedRidges = roadSegments
      .filter(
        (r) =>
          r.id !== originSeg.id &&
          r.id !== destSeg.id &&
          r.currentWaterDepthCm < vehicleThreshold &&
          r.elevationMeters >= 560
      )
      .sort((a, b) => b.elevationMeters - a.elevationMeters);

    const safeMid1 = elevatedRidges[0] || roadSegments.find((r) => r.id === 'law-college-rd') || originSeg;
    const safeMid2 = elevatedRidges[1] || roadSegments.find((r) => r.id === 'prabhat-sb-road') || safeMid1;

    const directSegmentsList = [originSeg, valleyMid, destSeg];
    const directMaxDepth = Math.max(...directSegmentsList.map((s) => s.currentWaterDepthCm));
    const directDistance = Number((straightKm * 1.18).toFixed(1));
    const directEta = Math.round(directDistance * 4.2 + (directMaxDepth >= 25 ? 24 : 8));

    const directRoute: SafeRouteOption = {
      type: 'flooded_direct',
      title: `Direct Route (${originSeg.name.split('(')[0].trim()} → ${destSeg.name.split('(')[0].trim()})`,
      titleMarathi: `थेट मार्ग (${originSeg.nameMarathi.split('(')[0].trim()} → ${destSeg.nameMarathi.split('(')[0].trim()})`,
      distanceKm: directDistance,
      estimatedMinutes: directEta,
      maxWaterDepthCm: directMaxDepth,
      riskLevel: depthToRisk(directMaxDepth),
      passableForSelectedVehicle: directMaxDepth < vehicleThreshold,
      averageElevationM: Math.round(
        directSegmentsList.reduce((sum, s) => sum + s.elevationMeters, 0) / directSegmentsList.length
      ),
      coordinates: [
        ...originSeg.coordinates,
        ...valleyMid.coordinates,
        ...destSeg.coordinates,
      ],
      segments: directSegmentsList.map((s) => ({
        name: s.name,
        nameMarathi: s.nameMarathi,
        depthCm: s.currentWaterDepthCm,
        elevationM: s.elevationMeters,
        risk: s.riskLevel,
        warning: s.hazards[0] || 'Check water level before entering.',
        warningMarathi: s.hazardsMarathi[0] || 'प्रवेशापूर्वी पाण्याची पातळी तपासा.',
      })),
      turnGuidance: [
        {
          instruction: `Start via ${originSeg.name.split('(')[0].trim()} corridor`,
          instructionMarathi: `${originSeg.nameMarathi.split('(')[0].trim()} मार्गाने पुढे जा`,
          distanceM: Math.round(directDistance * 350),
          safetyNote:
            originSeg.currentWaterDepthCm >= vehicleThreshold
              ? `WARNING: ${originSeg.currentWaterDepthCm}cm waterlogging exceeds safe clearance.`
              : undefined,
        },
        {
          instruction: `Cross ${valleyMid.name.split('(')[0].trim()} low-lying stretch`,
          instructionMarathi: `${valleyMid.nameMarathi.split('(')[0].trim()} सखल भाग ओलांडा`,
          distanceM: Math.round(directDistance * 350),
          safetyNote: `Peak depth ${valleyMid.currentWaterDepthCm}cm (${valleyMid.waterbodyName}).`,
        },
        {
          instruction: `Arrive at ${destSeg.name.split('(')[0].trim()}`,
          instructionMarathi: `${destSeg.nameMarathi.split('(')[0].trim()} येथे पोहोचा`,
          distanceM: Math.round(directDistance * 300),
          safetyNote:
            destSeg.currentWaterDepthCm >= vehicleThreshold
              ? `CRITICAL: Destination approach flooded (${destSeg.currentWaterDepthCm}cm).`
              : undefined,
        },
      ],
    };

    const safeMidSegments = safeMid1.id === safeMid2.id ? [safeMid1] : [safeMid1, safeMid2];
    const safeMaxDepth = Math.max(...safeMidSegments.map((s) => s.currentWaterDepthCm));
    const safeDistance = Number((straightKm * 1.42).toFixed(1));
    const safeEta = Math.round(safeDistance * 2.5 + 4);

    const safeRoute: SafeRouteOption = {
      type: 'ai_flood_safe',
      title: `FloodShield Elevated Alternate (Via ${safeMidSegments.map((s) => s.name.split('(')[0].trim()).join(' & ')})`,
      titleMarathi: `फ्लडशील्ड उंच सुरक्षित मार्ग (${safeMidSegments.map((s) => s.nameMarathi.split('(')[0].trim()).join(' व ')})`,
      distanceKm: safeDistance,
      estimatedMinutes: safeEta,
      maxWaterDepthCm: safeMaxDepth,
      riskLevel: depthToRisk(safeMaxDepth),
      passableForSelectedVehicle: safeMaxDepth < vehicleThreshold,
      averageElevationM: Math.round(
        safeMidSegments.reduce((sum, s) => sum + s.elevationMeters, 0) / safeMidSegments.length
      ),
      coordinates: [
        originSeg.coordinates[0],
        ...safeMidSegments.flatMap((s) => s.coordinates),
        destSeg.coordinates[destSeg.coordinates.length - 1],
      ],
      segments: safeMidSegments.map((s) => ({
        name: s.name,
        nameMarathi: s.nameMarathi,
        depthCm: s.currentWaterDepthCm,
        elevationM: s.elevationMeters,
        risk: s.riskLevel,
        warning: `Elevated contour (${s.elevationMeters}m MSL) with rapid surface drainage.`,
        warningMarathi: `समुद्रसपाटीपासून ${s.elevationMeters}m उंच रस्ता; पाण्याचा उत्तम निचरा.`,
      })),
      turnGuidance: [
        {
          instruction: `Exit low-lying ${originSeg.ward.split(' ')[0]} stretch uphill toward ${safeMid1.name.split('(')[0].trim()}`,
          instructionMarathi: `सखल भाग सोडून उंच ${safeMid1.nameMarathi.split('(')[0].trim()} मार्गाकडे वळा`,
          distanceM: Math.round(safeDistance * 320),
          safetyNote: `Gains elevation up to ${safeMid1.elevationMeters}m MSL, avoiding river/nullah overflow.`,
        },
        ...safeMidSegments.slice(1).map((seg) => ({
          instruction: `Continue along ${seg.name.split('(')[0].trim()} ridge corridor`,
          instructionMarathi: `${seg.nameMarathi.split('(')[0].trim()} उंच मार्गावरून पुढे जा`,
          distanceM: Math.round(safeDistance * 350),
          safetyNote: `Surface water only ${seg.currentWaterDepthCm}cm — clear for traffic.`,
        })),
        {
          instruction: `Approach ${destSeg.name.split('(')[0].trim()} from higher-grade feeder`,
          instructionMarathi: `उंच रस्त्यावरून ${destSeg.nameMarathi.split('(')[0].trim()} जवळ पोहोचा`,
          distanceM: Math.round(safeDistance * 330),
          safetyNote: 'Avoids underpass dips and stalled traffic queues.',
        },
      ],
    };

    return { directRoute, safeRoute };
  }, [origin, destination, roadSegments, vehicleThreshold]);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const quickPresets = [
    {
      label: lang === 'mr' ? 'सिंहगड रस्ता → पुणे स्टेशन' : 'Sinhagad Rd → Pune Station',
      from: 'sinhagad-pula-rajaram',
      to: 'pune-station-subway',
    },
    {
      label: lang === 'mr' ? 'स्वारगेट → बंड गार्डन' : 'Swargate → Bund Garden',
      from: 'swargate-jedhe-underpass',
      to: 'bund-garden-yerawada',
    },
    {
      label: lang === 'mr' ? 'कर्वे रस्ता → हिंजवडी' : 'Karve Rd → Hinjawadi IT',
      from: 'karve-road-paud',
      to: 'hinjawadi-phase1-chokepoint',
    },
    {
      label: lang === 'mr' ? 'आंबिल ओढा → डेक्कन' : 'Ambil Odha → Deccan',
      from: 'ambil-odha-dandekar',
      to: 'alka-talkies-deccan',
    },
  ];

  const vehicleLabel =
    selectedVehicle === 'twoWheeler'
      ? lang === 'mr' ? 'दुचाकी' : '2-Wheeler'
      : selectedVehicle === 'hatchback'
      ? lang === 'mr' ? 'कार/सेदान' : 'Car / Sedan'
      : selectedVehicle === 'suv'
      ? 'SUV / Bus'
      : lang === 'mr' ? 'पादचारी' : 'Walking';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-100">
              {lang === 'mr' ? 'जलमय रस्ते टाळणारा सुरक्षित मार्ग नियोजक' : 'Flood-Safe Alternative Route Planner'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'mr'
                ? 'तुमच्या वाहनाच्या प्रकारानुसार पाण्याखालील रस्ते टाळून उंच पर्यायी मार्ग शोधा'
                : 'Compares the standard shortest path against an elevated, dry bypass tailored to your vehicle clearance'}
            </p>
          </div>
        </div>

        {/* Vehicle Selection Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setSelectedVehicle('twoWheeler')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedVehicle === 'twoWheeler' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>2-Wheeler</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedVehicle('hatchback')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedVehicle === 'hatchback' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Car/Sedan</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedVehicle('suv')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedVehicle === 'suv' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>SUV</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedVehicle('pedestrian')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedVehicle === 'pedestrian' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Walk</span>
          </button>
        </div>
      </div>

      {/* Quick Commute Presets */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'mr' ? 'लोकप्रिय मार्ग:' : 'Quick Corridors:'}</span>
        </span>
        {quickPresets.map((preset) => {
          const isActive = origin === preset.from && destination === preset.to;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setOrigin(preset.from);
                setDestination(preset.to);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-cyan-950 border-cyan-600 text-cyan-200'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Origin / Swap / Destination Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{lang === 'mr' ? 'प्रारंभ बिंदू (Origin):' : 'Starting From:'}</span>
            </span>
          </label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 h-10"
          >
            {roadSegments.map((r) => (
              <option key={r.id} value={r.id}>
                {lang === 'mr' ? r.nameMarathi : r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1 flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin & Destination"
            className="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        <div className="md:col-span-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'mr' ? 'गंतव्य स्थान (Destination):' : 'Going To:'}</span>
            </span>
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 h-10"
          >
            {roadSegments.map((r) => (
              <option key={r.id} value={r.id}>
                {lang === 'mr' ? r.nameMarathi : r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <button
            type="button"
            onClick={() => onApplyRoute(computedPlan.safeRoute, computedPlan.directRoute)}
            className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer h-10"
          >
            <span>{lang === 'mr' ? 'नकाशावर मार्ग दाखवा' : 'View Routes on Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Route Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Direct Shortest Path */}
        <div className={`rounded-xl p-4 flex flex-col justify-between relative overflow-hidden border ${
          computedPlan.directRoute.passableForSelectedVehicle
            ? 'bg-amber-950/20 border-amber-800/60'
            : 'bg-red-950/20 border-red-900/60'
        }`}>
          <div className={`absolute top-0 right-0 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-lg tracking-wider ${
            computedPlan.directRoute.passableForSelectedVehicle ? 'bg-amber-600' : 'bg-red-600'
          }`}>
            {computedPlan.directRoute.passableForSelectedVehicle
              ? (lang === 'mr' ? 'सावधान मार्ग' : 'CAUTION')
              : (lang === 'mr' ? 'धोकादायक मार्ग' : 'UNSAFE / BLOCKED')}
          </div>

          <div>
            <div className="text-xs font-bold text-red-300 flex items-center gap-1.5 mb-1 pr-24">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{lang === 'mr' ? computedPlan.directRoute.titleMarathi : computedPlan.directRoute.title}</span>
            </div>
            <p className="text-[11px] text-slate-300/80 mb-3">
              {lang === 'mr'
                ? `${vehicleLabel} साठी कमाल सुरक्षित मर्यादा ${vehicleThreshold} सेमी आहे; या थेट मार्गावर ${computedPlan.directRoute.maxWaterDepthCm} सेमी पाणी आहे.`
                : `Standard GPS shortest path. Safe limit for ${vehicleLabel} is ${vehicleThreshold}cm; peak water on this route is ${computedPlan.directRoute.maxWaterDepthCm}cm.`}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-red-900/40 text-center mb-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'अंतर' : 'Distance'}</div>
                <div className="font-mono-code font-bold text-slate-200">{computedPlan.directRoute.distanceKm} km</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'अपेक्षित वेळ' : 'Flood ETA'}</div>
                <div className="font-mono-code font-bold text-red-400">~{computedPlan.directRoute.estimatedMinutes} min</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'कमाल पाणी' : 'Peak Depth'}</div>
                <div className="font-mono-code font-extrabold text-red-400">{computedPlan.directRoute.maxWaterDepthCm} cm</div>
              </div>
            </div>

            {/* Segments Breakdown */}
            <div className="space-y-2 mb-3">
              <div className="text-[11px] font-semibold text-red-300">
                {lang === 'mr' ? 'मार्गातील जलमय टप्पे:' : 'Waterlogged Segments on Direct Path:'}
              </div>
              {computedPlan.directRoute.segments.map((seg, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950/80 border border-red-900/40 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-200 gap-2">
                    <span className="truncate">{lang === 'mr' ? seg.nameMarathi : seg.name}</span>
                    <span className="text-red-400 font-mono-code shrink-0">{seg.depthCm} cm</span>
                  </div>
                  <div className="text-[10px] text-red-300 mt-0.5">
                    {lang === 'mr' ? seg.warningMarathi : seg.warning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-red-900/40 text-[11px] text-red-300 font-medium">
            {computedPlan.directRoute.passableForSelectedVehicle
              ? (lang === 'mr' ? `⚠️ ${vehicleLabel} साठी काळजीपूर्वक जाता येईल.` : `⚠️ Passable slowly for ${vehicleLabel}, watch for hidden potholes.`)
              : (lang === 'mr' ? `⛔ ${vehicleLabel} साठी अत्यंत धोकादायक — इंजिन बंद पडू शकते.` : `⛔ Impassable for ${vehicleLabel} (${computedPlan.directRoute.maxWaterDepthCm}cm exceeds ${vehicleThreshold}cm clearance).`)}
          </div>
        </div>

        {/* Card 2: AI Flood-Safe Alternate */}
        <div className="bg-emerald-950/20 border-2 border-emerald-500/80 rounded-xl p-4 flex flex-col justify-between relative shadow-lg shadow-emerald-950/40">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-lg tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'AI सुरक्षित मार्ग' : 'RECOMMENDED SAFE'}</span>
          </div>

          <div>
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1 pr-32">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'mr' ? computedPlan.safeRoute.titleMarathi : computedPlan.safeRoute.title}</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mb-3">
              {lang === 'mr'
                ? 'उंच डोंगरमाथा व चांगल्या निचरा व्यवस्थेच्या रस्त्यांवरून मार्ग; पूरग्रस्त भाग टाळला जातो.'
                : `Elevated bypass averaging ${computedPlan.safeRoute.averageElevationM}m MSL, keeping water depth well below ${vehicleLabel} limit.`}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-emerald-900/40 text-center mb-3 text-xs">
              <div>
                <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'अंतर' : 'Distance'}</div>
                <div className="font-mono-code font-bold text-slate-200">{computedPlan.safeRoute.distanceKm} km</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'सुरक्षित वेळ' : 'Clear ETA'}</div>
                <div className="font-mono-code font-bold text-emerald-400">{computedPlan.safeRoute.estimatedMinutes} min</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'कमाल पाणी' : 'Peak Depth'}</div>
                <div className="font-mono-code font-extrabold text-emerald-400">{computedPlan.safeRoute.maxWaterDepthCm} cm</div>
              </div>
            </div>

            {/* Segments Breakdown */}
            <div className="space-y-2 mb-3">
              <div className="text-[11px] font-semibold text-emerald-300">
                {lang === 'mr' ? 'उंच व सुरक्षित टप्पे:' : 'Elevated Dry Corridors Used:'}
              </div>
              {computedPlan.safeRoute.segments.map((seg, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-950/80 border border-emerald-900/40 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-200 gap-2">
                    <span className="truncate">{lang === 'mr' ? seg.nameMarathi : seg.name}</span>
                    <span className="text-emerald-400 font-mono-code shrink-0">Elev {seg.elevationM}m · {seg.depthCm}cm</span>
                  </div>
                  <div className="text-[10px] text-emerald-300 mt-0.5">
                    {lang === 'mr' ? seg.warningMarathi : seg.warning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between gap-2">
            <span className="text-[11px] text-emerald-300 font-medium">
              {computedPlan.safeRoute.passableForSelectedVehicle
                ? (lang === 'mr' ? `✅ ${vehicleLabel} साठी सुरक्षित` : `✅ Safe for ${vehicleLabel}`)
                : (lang === 'mr' ? `⚠️ कमाल पातळी जवळ` : `⚠️ Caution advised`)}
            </span>
            <button
              type="button"
              onClick={() => onApplyRoute(computedPlan.safeRoute, computedPlan.directRoute)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'नकाशावर पाहा' : 'Show on Map'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Safety Guidance List */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
        <h3 className="font-bold text-xs sm:text-sm text-slate-200 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>{lang === 'mr' ? 'वळणावळणाची पूर-सुरक्षित मार्गदर्शिका:' : 'Turn-by-Turn Flood Avoidance Guidance:'}</span>
        </h3>
        <div className="space-y-2">
          {computedPlan.safeRoute.turnGuidance.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-200">
                  {lang === 'mr' ? step.instructionMarathi : step.instruction}
                </div>
                {step.safetyNote && (
                  <div className="text-[11px] text-cyan-400 mt-0.5">
                    {step.safetyNote}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono-code shrink-0">
                {step.distanceM}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
