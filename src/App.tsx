import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PUNE_ROAD_SEGMENTS, 
  PUNE_WATERWAYS, 
  SAFE_ROUTES_CATALOG 
} from './data/puneRoadNetwork';
import { SAMPLE_CITIZEN_REPORTS } from './data/sampleReports';
import { 
  RoadSegment, 
  CitizenReport, 
  SafeRouteOption, 
  WeatherTelemetry, 
  RiskLevel 
} from './types/flood';
import { Navbar } from './components/Navbar';
import { FloodMap } from './components/FloodMap';
import { SimulationController } from './components/SimulationController';
import { SafeRoutePlanner } from './components/SafeRoutePlanner';
import { CitizenUploadModal } from './components/CitizenUploadModal';
import { MarathiAlertCenter } from './components/MarathiAlertCenter';
import { CivicActionTracker } from './components/CivicActionTracker';
import { RoadDetailPanel } from './components/RoadDetailPanel';
import { EmergencySosModal } from './components/EmergencySosModal';
import { 
  Camera, 
  Navigation, 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
  Droplets,
  ChevronRight,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'en' | 'mr'>('en');
  const [activeTab, setActiveTab] = useState<'map' | 'routes' | 'citizen-ai' | 'marathi-alerts' | 'civic-cell'>('map');
  
  // Weather & Hydrological Telemetry State
  const [weather, setWeather] = useState<WeatherTelemetry>({
    rainfallIntensityMmHr: 48,
    forecastNext3HrMmHr: 65,
    khadakwaslaDamDischargeCusecs: 28400,
    damStatus: 'danger_level',
    rainBandMovement: 'East-Northeast towards Hadapsar',
    soilSaturationPercent: 88,
    timeHorizon: 'now',
    cloudCoverPercent: 95,
  });

  // Citizen Reports State
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(SAMPLE_CITIZEN_REPORTS);
  
  // Start with no blocking overlay on the map so users see all corridors clearly first
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [contextRoadId, setContextRoadId] = useState<string | null>('sinhagad-pula-rajaram');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Routing state
  const [activeRoute, setActiveRoute] = useState<SafeRouteOption | null>(SAFE_ROUTES_CATALOG[0].safeRoute);
  const [activeDirectRoute, setActiveDirectRoute] = useState<SafeRouteOption | null>(SAFE_ROUTES_CATALOG[0].directRoute);

  // Map layer controls
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [showWaterways, setShowWaterways] = useState<boolean>(true);
  const [showCitizenReports, setShowCitizenReports] = useState<boolean>(true);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Filter & search road list in sidebar
  const [roadFilter, setRoadFilter] = useState<'all' | 'severe' | 'impassable' | 'warning' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  // Compute dynamic road segment waterlogging based on rainfall, dam discharge, and time horizon
  const dynamicRoadSegments: RoadSegment[] = useMemo(() => {
    const rain = weather.rainfallIntensityMmHr;
    const damDischarge = weather.khadakwaslaDamDischargeCusecs;

    let timeMultiplier = 1.0;
    if (weather.timeHorizon === '+1h') timeMultiplier = 1.25;
    if (weather.timeHorizon === '+3h') timeMultiplier = 1.55;
    if (weather.timeHorizon === '+6h') timeMultiplier = 0.65;

    return PUNE_ROAD_SEGMENTS.map((road) => {
      let depth = 0;

      if (road.baseElevationCategory === 'ridge') {
        depth = Math.max(1, Math.round((rain * 0.08) * timeMultiplier));
      } else if (road.baseElevationCategory === 'elevated') {
        depth = Math.max(2, Math.round((rain * 0.18) * timeMultiplier));
      } else if (road.baseElevationCategory === 'moderate') {
        depth = Math.max(4, Math.round((rain * 0.42) * timeMultiplier));
      } else if (road.baseElevationCategory === 'valley') {
        const riverBackflow = damDischarge > 25000 ? (damDischarge - 25000) * 0.0006 : 0;
        depth = Math.max(6, Math.round((rain * 0.65 + riverBackflow) * timeMultiplier));
      } else {
        const riverBackflow = damDischarge > 20000 ? (damDischarge - 20000) * 0.0009 : 0;
        depth = Math.max(8, Math.round((rain * 0.82 + riverBackflow) * timeMultiplier));
      }

      // Apply latest verified citizen report depth weighting
      const matchingReport = citizenReports.find((r) => r.roadSegmentId === road.id);
      if (matchingReport) {
        const reportedDepth = matchingReport.aiAnalysis?.estimatedDepthCm ?? matchingReport.userEstimatedDepthCm;
        depth = Math.round((depth + reportedDepth) / 2);
      }

      let riskLevel: RiskLevel = 'safe';
      if (depth >= 50) {
        riskLevel = 'impassable';
      } else if (depth >= 25) {
        riskLevel = 'severe';
      } else if (depth >= 10) {
        riskLevel = 'warning';
      } else {
        riskLevel = 'safe';
      }

      return {
        ...road,
        currentWaterDepthCm: depth,
        riskLevel,
        vehicleAccessibility: {
          twoWheeler: depth < 15,
          hatchback: depth < 25,
          suv: depth < 48,
          pedestrian: depth < 20,
        },
      };
    });
  }, [weather, citizenReports]);

  // Summary counts for quick situation strip
  const summaryStats = useMemo(() => {
    const safeCount = dynamicRoadSegments.filter((r) => r.riskLevel === 'safe').length;
    const warningCount = dynamicRoadSegments.filter((r) => r.riskLevel === 'warning').length;
    const criticalCount = dynamicRoadSegments.filter(
      (r) => r.riskLevel === 'severe' || r.riskLevel === 'impassable'
    ).length;
    return { safeCount, warningCount, criticalCount };
  }, [dynamicRoadSegments]);

  const selectedSegment = useMemo(() => {
    return dynamicRoadSegments.find((r) => r.id === selectedSegmentId) || null;
  }, [dynamicRoadSegments, selectedSegmentId]);

  // Auto simulation storm progression
  useEffect(() => {
    if (!isSimulating) return;

    const horizons: WeatherTelemetry['timeHorizon'][] = ['now', '+1h', '+3h', '+6h'];
    const interval = setInterval(() => {
      setWeather((prev) => {
        const currentIndex = horizons.indexOf(prev.timeHorizon);
        const nextIndex = (currentIndex + 1) % horizons.length;
        const nextHorizon = horizons[nextIndex];

        let nextRain = prev.rainfallIntensityMmHr;
        if (nextHorizon === '+1h') nextRain = 68;
        if (nextHorizon === '+3h') nextRain = 92;
        if (nextHorizon === '+6h') nextRain = 35;
        if (nextHorizon === 'now') nextRain = 48;

        return {
          ...prev,
          timeHorizon: nextHorizon,
          rainfallIntensityMmHr: nextRain,
        };
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleAddCitizenReport = useCallback(
    (newReport: CitizenReport, updatedDepthCm: number) => {
      setCitizenReports((prev) => [newReport, ...prev]);
      setSelectedSegmentId(newReport.roadSegmentId);
      setActiveTab('map');
      showToast(
        lang === 'mr'
          ? `नवीन फोटो नोंदवला (~${updatedDepthCm} सेमी पाणी). नकाशा अपडेट झाला आहे.`
          : `Report pinned (~${updatedDepthCm}cm depth). Live road map updated.`
      );
    },
    [lang, showToast]
  );

  const handleChangeWeather = (updated: Partial<WeatherTelemetry>) => {
    setWeather((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyRoute = (safeRoute: SafeRouteOption, directRoute: SafeRouteOption) => {
    setActiveRoute(safeRoute);
    setActiveDirectRoute(directRoute);
    setSelectedSegmentId(null);
    setActiveTab('map');
    showToast(
      lang === 'mr'
        ? `सुरक्षित पर्यायी मार्ग नकाशावर दाखवला आहे (कमाल पाणी: ${safeRoute.maxWaterDepthCm} सेमी).`
        : `Safe alternate route plotted on map (max water ${safeRoute.maxWaterDepthCm}cm vs ${directRoute.maxWaterDepthCm}cm direct).`
    );
  };

  // Filtered + searched roads for sidebar list
  const filteredRoads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dynamicRoadSegments.filter((r) => {
      const matchesRisk =
        roadFilter === 'all'
          ? true
          : roadFilter === 'severe'
          ? r.riskLevel === 'severe' || r.riskLevel === 'impassable'
          : r.riskLevel === roadFilter;

      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.nameMarathi.toLowerCase().includes(q) ||
        r.ward.toLowerCase().includes(q) ||
        r.wardMarathi.toLowerCase().includes(q);

      return matchesRisk && matchesSearch;
    });
  }, [dynamicRoadSegments, roadFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Disaster Command Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        weather={weather}
        onOpenUpload={() => {
          setContextRoadId(selectedSegmentId || 'sinhagad-pula-rajaram');
          setIsUploadModalOpen(true);
        }}
        onOpenSosModal={() => setIsSosModalOpen(true)}
      />

      {/* Non-blocking Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-600/80 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* TAB 1: Risk Map & Live Forecast */}
        {activeTab === 'map' && (
          <div className="space-y-3.5">
            {/* At-a-Glance Situation Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedSegmentId(null);
                  setRoadFilter('safe');
                }}
                className="p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-800/60 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] text-emerald-300 font-semibold">
                    {lang === 'mr' ? 'सुरक्षित रस्ते' : 'Passable Roads'}
                  </div>
                  <div className="font-mono-code font-extrabold text-xl text-white mt-0.5">
                    {summaryStats.safeCount}
                  </div>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400/80" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSegmentId(null);
                  setRoadFilter('warning');
                }}
                className="p-3 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/60 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] text-amber-300 font-semibold">
                    {lang === 'mr' ? 'सावधान मार्ग' : 'Caution / Ponding'}
                  </div>
                  <div className="font-mono-code font-extrabold text-xl text-white mt-0.5">
                    {summaryStats.warningCount}
                  </div>
                </div>
                <Droplets className="w-6 h-6 text-amber-400/80" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSegmentId(null);
                  setRoadFilter('severe');
                }}
                className="p-3 rounded-xl bg-red-950/35 hover:bg-red-950/55 border border-red-800/70 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] text-red-300 font-semibold">
                    {lang === 'mr' ? 'टाळायचे / बंद रस्ते' : 'Severe / Closed'}
                  </div>
                  <div className="font-mono-code font-extrabold text-xl text-white mt-0.5">
                    {summaryStats.criticalCount}
                  </div>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-400/80" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('citizen-ai')}
                className="p-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-800/60 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] text-cyan-300 font-semibold">
                    {lang === 'mr' ? 'नागरिक फोटो पडताळणी' : 'Verified Photo Reports'}
                  </div>
                  <div className="font-mono-code font-extrabold text-xl text-white mt-0.5">
                    {citizenReports.length}
                  </div>
                </div>
                <Camera className="w-6 h-6 text-cyan-400/80" />
              </button>
            </div>

            {/* Compact Weather & Simulation Controls */}
            <SimulationController
              weather={weather}
              onChangeWeather={handleChangeWeather}
              showRadar={showRadar}
              setShowRadar={setShowRadar}
              showWaterways={showWaterways}
              setShowWaterways={setShowWaterways}
              showCitizenReports={showCitizenReports}
              setShowCitizenReports={setShowCitizenReports}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
              lang={lang}
            />

            {/* Map (8 cols) + Searchable Road List / Docked Inspector (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Unobstructed Interactive GIS Map */}
              <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative shadow-2xl h-[480px] lg:h-[640px]">
                <FloodMap
                  roadSegments={dynamicRoadSegments}
                  waterways={PUNE_WATERWAYS}
                  citizenReports={citizenReports}
                  selectedSegment={selectedSegment}
                  onSelectSegment={(seg) => setSelectedSegmentId(seg.id)}
                  activeRoute={activeRoute}
                  activeDirectRoute={activeDirectRoute}
                  onClearRoute={() => {
                    setActiveRoute(null);
                    setActiveDirectRoute(null);
                  }}
                  showRadar={showRadar}
                  showWaterways={showWaterways}
                  showCitizenReports={showCitizenReports}
                  lang={lang}
                  onReportClick={(rep) => {
                    setSelectedSegmentId(rep.roadSegmentId);
                  }}
                />
              </div>

              {/* Right Column: Selected Road Inspector OR Searchable Corridor List */}
              <div className="lg:col-span-4">
                {selectedSegment ? (
                  <RoadDetailPanel
                    segment={selectedSegment}
                    weather={weather}
                    onClose={() => setSelectedSegmentId(null)}
                    onPlanRouteForSegment={(seg) => {
                      setContextRoadId(seg.id);
                      setActiveTab('routes');
                    }}
                    onUploadForSegment={(seg) => {
                      setContextRoadId(seg.id);
                      setIsUploadModalOpen(true);
                    }}
                    onAlertForSegment={(seg) => {
                      setContextRoadId(seg.id);
                      setActiveTab('marathi-alerts');
                    }}
                    lang={lang}
                  />
                ) : (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl h-full lg:h-[640px]">
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-100">
                            {lang === 'mr' ? 'पुणे रस्ते जलमय स्थिती' : 'Check Road Conditions'}
                          </h3>
                          <p className="text-[10px] text-slate-400">
                            {lang === 'mr' ? 'कोणत्याही रस्त्यावर क्लिक करा' : 'Select any street for depth & passability'}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono-code text-cyan-400 font-bold">
                          {filteredRoads.length}/{dynamicRoadSegments.length}
                        </span>
                      </div>

                      {/* Search Box */}
                      <div className="relative mt-2.5">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={lang === 'mr' ? 'रस्ता किंवा प्रभाग शोधा...' : 'Search road, area, or ward...'}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center gap-1 my-2.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setRoadFilter('all')}
                          className={`flex-1 py-1 rounded font-medium cursor-pointer ${roadFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          {lang === 'mr' ? 'सर्व' : 'All'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoadFilter('severe')}
                          className={`flex-1 py-1 rounded font-medium cursor-pointer ${roadFilter === 'severe' ? 'bg-red-700 text-white' : 'text-red-400 hover:text-red-300'}`}
                        >
                          {lang === 'mr' ? 'धोकादायक' : 'Severe'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoadFilter('warning')}
                          className={`flex-1 py-1 rounded font-medium cursor-pointer ${roadFilter === 'warning' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-amber-300'}`}
                        >
                          {lang === 'mr' ? 'सावधान' : 'Watch'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRoadFilter('safe')}
                          className={`flex-1 py-1 rounded font-medium cursor-pointer ${roadFilter === 'safe' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'}`}
                        >
                          {lang === 'mr' ? 'सुरक्षित' : 'Safe'}
                        </button>
                      </div>

                      {/* Road List */}
                      <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                        {filteredRoads.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-500">
                            {lang === 'mr' ? 'जुळणारे रस्ते सापडले नाहीत.' : 'No matching road corridors found.'}
                          </div>
                        ) : (
                          filteredRoads.map((road) => {
                            const isImpassable = road.riskLevel === 'impassable';
                            const isSevere = road.riskLevel === 'severe';
                            const isSafe = road.riskLevel === 'safe';

                            return (
                              <button
                                key={road.id}
                                type="button"
                                onClick={() => setSelectedSegmentId(road.id)}
                                className="w-full text-left p-2.5 rounded-xl border bg-slate-950/70 border-slate-800 hover:border-cyan-600/70 hover:bg-slate-800/50 text-xs cursor-pointer transition-all"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="font-semibold text-slate-200 truncate">
                                      {lang === 'mr' ? road.nameMarathi : road.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                      Elev: {road.elevationMeters}m · {road.proximityToWaterbodyM}m from {road.waterbodyName}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span
                                      className={`font-mono-code font-bold text-xs ${
                                        isImpassable
                                          ? 'text-red-400'
                                          : isSevere
                                          ? 'text-rose-400'
                                          : isSafe
                                          ? 'text-emerald-400'
                                          : 'text-amber-400'
                                      }`}
                                    >
                                      {road.currentWaterDepthCm} cm
                                    </span>
                                    <div className="text-[9px] uppercase font-bold text-slate-500">
                                      {road.riskLevel}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Quick Safe Route Callout */}
                    <div className="pt-3 mt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveTab('routes')}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'सुरक्षित पर्यायी मार्ग शोधा' : 'Find Flood-Safe Alternate Route'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Flood-Safe Route Planner */}
        {activeTab === 'routes' && (
          <SafeRoutePlanner
            roadSegments={dynamicRoadSegments}
            onApplyRoute={handleApplyRoute}
            initialOriginId={contextRoadId}
            lang={lang}
          />
        )}

        {/* TAB 3: Citizen Photo AI Analyzer */}
        {activeTab === 'citizen-ai' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-100">
                      {lang === 'mr' ? 'नागरिक पूर छायाचित्रे व AI खोली विश्लेषण' : 'Citizen Flood Photo Feed & AI Verification'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {lang === 'mr'
                        ? 'नागरिकांनी पाठवलेल्या फोटोंचे विश्लेषण करून वाहनांची प्रवेशक्षमता निश्चित केली जाते'
                        : 'Crowdsourced street flood photos analyzed for water depth, tyre submergence, and vehicle safety'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setContextRoadId(selectedSegmentId || 'sinhagad-pula-rajaram');
                    setIsUploadModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer self-start sm:self-auto"
                >
                  <Camera className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'नवीन फोटो पाठवा' : 'Upload Flooded Road Photo'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {citizenReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          src={rep.imageUrl}
                          alt={rep.roadName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-mono-code font-bold text-white border border-slate-700 flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{rep.aiAnalysis?.estimatedDepthCm || rep.userEstimatedDepthCm} cm Depth</span>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-slate-950/90 backdrop-blur px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono-code border border-slate-800">
                          {rep.timestamp}
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-slate-100">
                            {lang === 'mr' ? rep.roadNameMarathi : rep.roadName}
                          </h4>
                          <span className="text-[10px] text-cyan-400 font-semibold uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 shrink-0">
                            {rep.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400">
                          {lang === 'mr' ? 'नोंदवणारे:' : 'Reported by:'}{' '}
                          <span className="text-slate-300 font-medium">{rep.reportedBy}</span>
                        </div>

                        {rep.aiAnalysis && (
                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                            <div className="font-semibold flex items-center gap-1 text-[10px] uppercase text-cyan-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{lang === 'mr' ? 'AI छायाचित्र तपासणी' : 'AI Visual Benchmark Verification'}</span>
                            </div>
                            <ul className="space-y-0.5 text-slate-300 pl-2">
                              {rep.aiAnalysis.depthVisualIndicators.slice(0, 2).map((ind, i) => (
                                <li key={i} className="line-clamp-1">• {ind}</li>
                              ))}
                            </ul>
                            <div className="text-[11px] text-amber-300 font-marathi pt-1 border-t border-slate-800">
                              {lang === 'mr' ? rep.aiAnalysis.aiObservationSummaryMarathi : rep.aiAnalysis.aiObservationSummary}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSegmentId(rep.roadSegmentId);
                          setActiveTab('map');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{lang === 'mr' ? 'नकाशावर पहा' : 'View on GIS Map'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setContextRoadId(rep.roadSegmentId);
                          setActiveTab('marathi-alerts');
                        }}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{lang === 'mr' ? 'मराठी अलर्ट पाठवा' : 'Broadcast Alert'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Localized Marathi Alerts */}
        {activeTab === 'marathi-alerts' && (
          <MarathiAlertCenter
            roadSegments={dynamicRoadSegments}
            initialRoadId={contextRoadId}
            lang={lang}
          />
        )}

        {/* TAB 5: Civic Action & July 2026 Cell */}
        {activeTab === 'civic-cell' && (
          <CivicActionTracker
            roadSegments={dynamicRoadSegments}
            lang={lang}
          />
        )}
      </main>

      {/* Citizen Photo Upload & Gemini Depth Modal */}
      <CitizenUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        roadSegments={dynamicRoadSegments}
        onAddReport={handleAddCitizenReport}
        initialRoadId={contextRoadId}
        lang={lang}
      />

      {/* Emergency Rescue SOS 112 Modal */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            FloodShield AI · Hyperlocal Street-Level Urban Flood Intelligence & Routing Platform
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Pune July 2026 Civic Flood Benchmark</span>
            <span>·</span>
            <span>PMC Disaster Cell</span>
            <span>·</span>
            <span className="font-marathi">मराठी आपत्ती कक्ष</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
