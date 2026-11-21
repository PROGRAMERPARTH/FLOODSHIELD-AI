import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocateFixed, RotateCcw, X, Navigation } from 'lucide-react';
import { RoadSegment, WaterwayChannel, CitizenReport, SafeRouteOption, RiskLevel } from '../types/flood';

interface FloodMapProps {
  roadSegments: RoadSegment[];
  waterways: WaterwayChannel[];
  citizenReports: CitizenReport[];
  selectedSegment: RoadSegment | null;
  onSelectSegment: (segment: RoadSegment) => void;
  activeRoute: SafeRouteOption | null;
  activeDirectRoute: SafeRouteOption | null;
  onClearRoute?: () => void;
  showRadar: boolean;
  showWaterways: boolean;
  showCitizenReports: boolean;
  lang: 'en' | 'mr';
  onReportClick: (report: CitizenReport) => void;
}

export const FloodMap: React.FC<FloodMapProps> = ({
  roadSegments,
  waterways,
  citizenReports,
  selectedSegment,
  onSelectSegment,
  activeRoute,
  activeDirectRoute,
  onClearRoute,
  showRadar,
  showWaterways,
  showCitizenReports,
  lang,
  onReportClick,
}) => {
  const [basemapStyle, setBasemapStyle] = useState<'dark' | 'satellite'>('dark');
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const layersRef = useRef<{
    roadsLayer: L.FeatureGroup;
    waterwaysLayer: L.FeatureGroup;
    reportsLayer: L.FeatureGroup;
    routesLayer: L.FeatureGroup;
    radarLayer: L.LayerGroup;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Pune flood corridor (Deccan - Alka Talkies - Sinhagad Rd)
    const map = L.map(mapContainerRef.current, {
      center: [18.514, 73.845],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    const baseLayerGroup = L.layerGroup().addTo(map);
    baseLayerGroupRef.current = baseLayerGroup;

    // Default keyless OpenStreetMap tiles with crisp dark-mode filter
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      className: 'flood-dark-tiles',
    }).addTo(baseLayerGroup);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create feature groups
    const roadsLayer = L.featureGroup().addTo(map);
    const waterwaysLayer = L.featureGroup().addTo(map);
    const reportsLayer = L.featureGroup().addTo(map);
    const routesLayer = L.featureGroup().addTo(map);
    const radarLayer = L.layerGroup().addTo(map);
    const userLocationLayer = L.layerGroup().addTo(map);
    userLocationLayerRef.current = userLocationLayer;

    layersRef.current = {
      roadsLayer,
      waterwaysLayer,
      reportsLayer,
      routesLayer,
      radarLayer,
    };

    mapInstanceRef.current = map;

    // Trigger resize check
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      baseLayerGroupRef.current = null;
      userLocationLayerRef.current = null;
    };
  }, []);

  // Pan smoothly to selected segment when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSegment) return;
    const midIdx = Math.floor(selectedSegment.coordinates.length / 2);
    const target = selectedSegment.coordinates[midIdx];
    if (target) {
      mapInstanceRef.current.panTo(target, { animate: true, duration: 0.6 });
    }
  }, [selectedSegment?.id]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([18.514, 73.845], 13, { animate: true });
    setGeoStatus(null);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoStatus(lang === 'mr' ? 'या ब्राउझरमध्ये लोकेशन उपलब्ध नाही.' : 'Geolocation unavailable in this browser.');
      return;
    }
    setGeoStatus(lang === 'mr' ? 'तुमचे स्थान शोधत आहे...' : 'Locating your GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current && userLocationLayerRef.current) {
          userLocationLayerRef.current.clearLayers();
          const userIcon = L.divIcon({
            className: 'user-gps-pin',
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#38bdf8;border:3px solid white;box-shadow:0 0 12px rgba(56,189,248,0.9);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          L.marker([latitude, longitude], { icon: userIcon })
            .bindTooltip(lang === 'mr' ? 'तुमचे सध्याचे स्थान' : 'Your Location')
            .addTo(userLocationLayerRef.current);
          mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
        }
        setGeoStatus(null);
      },
      () => {
        setGeoStatus(lang === 'mr' ? 'लोकेशन परवानगी नाकारली.' : 'Location permission denied or unavailable.');
        setTimeout(() => setGeoStatus(null), 3500);
      },
      { timeout: 6000 }
    );
  };

  // Switch Basemap (Dark Street Map vs Satellite Imagery)
  useEffect(() => {
    if (!baseLayerGroupRef.current) return;
    const baseGroup = baseLayerGroupRef.current;
    baseGroup.clearLayers();

    if (basemapStyle === 'dark') {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        className: 'flood-dark-tiles',
      }).addTo(baseGroup);
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }).addTo(baseGroup);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.85,
      }).addTo(baseGroup);
    }
  }, [basemapStyle]);

  // Update Road Segments Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current) return;
    const { roadsLayer } = layersRef.current;
    roadsLayer.clearLayers();

    const getRiskColor = (risk: RiskLevel) => {
      switch (risk) {
        case 'safe':
          return '#10b981'; // Emerald 500
        case 'warning':
          return '#f59e0b'; // Amber 500
        case 'severe':
          return '#ef4444'; // Red 500
        case 'impassable':
          return '#991b1b'; // Dark Red 800
      }
    };

    roadSegments.forEach((segment) => {
      const isSelected = selectedSegment?.id === segment.id;
      const color = getRiskColor(segment.riskLevel);
      const weight = isSelected ? 8 : 6;
      const opacity = isSelected ? 1 : 0.85;

      const polyline = L.polyline(segment.coordinates, {
        color,
        weight,
        opacity,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: segment.riskLevel === 'impassable' ? '6, 8' : undefined,
      });

      // Interactive popup
      const popupContent = `
        <div style="min-width: 200px; padding: 4px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${color}; margin-bottom: 2px;">
            ${segment.riskLevel.toUpperCase()} · ${segment.currentWaterDepthCm} cm WATER
          </div>
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
            ${lang === 'mr' ? segment.nameMarathi : segment.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            ${lang === 'mr' ? segment.wardMarathi : segment.ward} · Elev: ${segment.elevationMeters}m
          </div>
          <div style="font-size: 11px; line-height: 1.4; color: #cbd5e1; margin-bottom: 8px;">
            ${lang === 'mr' ? segment.hazardsMarathi[0] || '' : segment.hazards[0] || ''}
          </div>
          <button id="inspect-btn-${segment.id}" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
            ${lang === 'mr' ? 'तपशील व सुरक्षित मार्ग पहा' : 'Inspect Flood Telemetry'}
          </button>
        </div>
      `;

      polyline.bindPopup(popupContent, { maxWidth: 280 });

      polyline.on('click', () => {
        onSelectSegment(segment);
      });

      polyline.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${segment.id}`);
        if (btn) {
          btn.onclick = () => onSelectSegment(segment);
        }
      });

      roadsLayer.addLayer(polyline);
    });
  }, [roadSegments, selectedSegment, lang, onSelectSegment]);

  // Update Waterways (Mutha River & Nullahs)
  useEffect(() => {
    if (!layersRef.current) return;
    const { waterwaysLayer } = layersRef.current;
    waterwaysLayer.clearLayers();

    if (!showWaterways) return;

    waterways.forEach((channel) => {
      const isRiver = channel.type === 'river';
      const color = isRiver ? '#0ea5e9' : '#06b6d4';
      const weight = isRiver ? 10 : 6;

      const polyline = L.polyline(channel.coordinates, {
        color,
        weight,
        opacity: 0.8,
        lineJoin: 'round',
      });

      polyline.bindTooltip(
        `<b>${lang === 'mr' ? channel.nameMarathi : channel.name}</b><br/>Discharge: ${channel.dischargeCusecs?.toLocaleString() || 'N/A'} cusecs (${channel.currentDischargeLevel.toUpperCase()})`,
        { sticky: true, className: 'waterway-tooltip' }
      );

      waterwaysLayer.addLayer(polyline);
    });
  }, [waterways, showWaterways, lang]);

  // Update Citizen Reports Pins
  useEffect(() => {
    if (!layersRef.current) return;
    const { reportsLayer } = layersRef.current;
    reportsLayer.clearLayers();

    if (!showCitizenReports) return;

    citizenReports.forEach((rep) => {
      const isCritical = rep.aiAnalysis?.urgencyLevel === 'CRITICAL' || rep.aiAnalysis?.urgencyLevel === 'HIGH';
      const pulseClass = isCritical ? 'pulse-marker-severe' : 'pulse-marker-warning';
      const depthBadge = rep.aiAnalysis?.estimatedDepthCm || rep.userEstimatedDepthCm;

      const icon = L.divIcon({
        className: 'custom-flood-pin',
        html: `
          <div class="${pulseClass}" style="
            background: #0f172a; 
            border: 2px solid ${isCritical ? '#ef4444' : '#f59e0b'}; 
            color: #ffffff; 
            width: 38px; 
            height: 38px; 
            border-radius: 50%; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            cursor: pointer;
            font-family: sans-serif;
          ">
            <span style="font-size: 13px; line-height: 1;">📷</span>
            <span style="font-size: 8px; font-weight: 800; color: ${isCritical ? '#fca5a5' : '#fcd34d'}; line-height: 1; margin-top: 1px;">${depthBadge}cm</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker(rep.location, { icon });

      marker.on('click', () => {
        onReportClick(rep);
      });

      marker.bindTooltip(
        `<b>${lang === 'mr' ? rep.roadNameMarathi : rep.roadName}</b><br/>AI Verified: ${depthBadge}cm depth<br/><i>${rep.reportedBy}</i>`,
        { direction: 'top', offset: [0, -18] }
      );

      reportsLayer.addLayer(marker);
    });
  }, [citizenReports, showCitizenReports, lang, onReportClick]);

  // Update Safe Route Polyline Overlay
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current) return;
    const { routesLayer } = layersRef.current;
    routesLayer.clearLayers();

    if (!activeRoute) return;

    // Draw Dangerous Direct Route if present
    if (activeDirectRoute) {
      const directPoly = L.polyline(activeDirectRoute.coordinates, {
        color: '#dc2626',
        weight: 6,
        opacity: 0.75,
        dashArray: '8, 8',
      });
      directPoly.bindTooltip(
        `<b>${lang === 'mr' ? 'थेट धोकादायक मार्ग' : 'Flooded Direct Route'}</b><br/>${lang === 'mr' ? 'कमाल पाणी:' : 'Max Depth:'} ${activeDirectRoute.maxWaterDepthCm}cm (${lang === 'mr' ? 'धोकादायक' : 'HAZARDOUS'})`,
        { sticky: true }
      );
      routesLayer.addLayer(directPoly);
    }

    // Draw AI Flood-Safe Alternate Route
    const safePoly = L.polyline(activeRoute.coordinates, {
      color: '#10b981',
      weight: 8,
      opacity: 0.95,
      lineCap: 'round',
    });
    safePoly.bindTooltip(
      `<b>${lang === 'mr' ? 'फ्लडशील्ड सुरक्षित पर्यायी मार्ग' : 'AI Flood-Safe Recommended Route'}</b><br/>${lang === 'mr' ? 'कमाल पाणी:' : 'Max Depth:'} ${activeRoute.maxWaterDepthCm}cm · Elev: ${activeRoute.averageElevationM}m`,
      { sticky: true }
    );
    routesLayer.addLayer(safePoly);

    // Add Start and End Pins
    const startCoords = activeRoute.coordinates[0];
    const endCoords = activeRoute.coordinates[activeRoute.coordinates.length - 1];

    if (startCoords && endCoords) {
      const startIcon = L.divIcon({
        className: 'route-start-pin',
        html: `<div style="background:#3b82f6;color:white;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.5);">A</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const endIcon = L.divIcon({
        className: 'route-end-pin',
        html: `<div style="background:#10b981;color:white;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.5);">B</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      routesLayer.addLayer(L.marker(startCoords, { icon: startIcon }));
      routesLayer.addLayer(L.marker(endCoords, { icon: endIcon }));

      // Fit bounds to route
      const bounds = L.latLngBounds([...activeRoute.coordinates, ...(activeDirectRoute?.coordinates || [])]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [activeRoute, activeDirectRoute, lang]);

  // Update Radar Precipitation Layer
  useEffect(() => {
    if (!layersRef.current) return;
    const { radarLayer } = layersRef.current;
    radarLayer.clearLayers();

    if (!showRadar) return;

    // Simulate animated Doppler rain cells centered on Mutha catchment & city center
    const rainCells = [
      { center: [18.515, 73.835] as [number, number], radius: 2400, color: '#3b82f6', opacity: 0.25 },
      { center: [18.490, 73.830] as [number, number], radius: 3200, color: '#ef4444', opacity: 0.3 }, // Intense cell near Sinhagad Rd & Ambil Odha
      { center: [18.530, 73.865] as [number, number], radius: 2000, color: '#f59e0b', opacity: 0.22 },
    ];

    rainCells.forEach((cell) => {
      const circle = L.circle(cell.center, {
        radius: cell.radius,
        fillColor: cell.color,
        fillOpacity: cell.opacity,
        color: cell.color,
        weight: 1,
        dashArray: '4, 4',
      });
      circle.bindTooltip(`Doppler Rain Band: High Inundation Surge Zone`, { sticky: true });
      radarLayer.addLayer(circle);
    });
  }, [showRadar]);

  return (
    <div className="relative w-full h-full min-h-[460px]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top-Left Map Utility Actions (Near Me, Reset View, Clear Route) */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={handleLocateMe}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/92 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-[11px] font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'mr' ? 'माझे स्थान' : 'Near Me'}</span>
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/92 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-[11px] font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Center on Pune"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'mr' ? 'पुणे केंद्र' : 'Pune View'}</span>
        </button>

        {activeRoute && onClearRoute && (
          <button
            type="button"
            onClick={onClearRoute}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/95 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-[11px] font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>{lang === 'mr' ? 'मार्ग लपवा' : 'Clear Route'}</span>
            <X className="w-3 h-3" />
          </button>
        )}

        {geoStatus && (
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-cyan-800 text-cyan-300 text-[11px] font-medium shadow-lg">
            {geoStatus}
          </div>
        )}
      </div>

      {/* Map Overlay Controls / Legend */}
      <div className="absolute top-3 right-3 z-10 bg-slate-900/92 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs min-w-[210px] pointer-events-auto space-y-2.5">
        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setBasemapStyle('dark')}
            className={`flex-1 py-1 px-2 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
              basemapStyle === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'mr' ? 'रस्ता नकाशा' : 'Street Map'}
          </button>
          <button
            type="button"
            onClick={() => setBasemapStyle('satellite')}
            className={`flex-1 py-1 px-2 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
              basemapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'mr' ? 'उपग्रह दृश्य' : 'Satellite'}
          </button>
        </div>

        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="font-semibold text-slate-200">
            {lang === 'mr' ? 'रस्त्यांचे जोखीम वर्गीकरण' : 'Road Inundation Risk'}
          </span>
          <span className="text-[10px] text-slate-400">Live GIS</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span className="text-slate-300">{lang === 'mr' ? 'सुरक्षित (<१० सेमी)' : 'Safe (<10cm)'}</span>
            </span>
            <span className="text-slate-400 font-mono-code shrink-0">Passable</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
              <span className="text-slate-300">{lang === 'mr' ? 'सावधान (१०-२५ सेमी)' : 'Warning (10-25cm)'}</span>
            </span>
            <span className="text-amber-400 font-mono-code shrink-0">Caution</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
              <span className="text-slate-300">{lang === 'mr' ? 'गंभीर (२५-५० सेमी)' : 'Severe (25-50cm)'}</span>
            </span>
            <span className="text-red-400 font-mono-code shrink-0">2W Blocked</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-red-800 border border-red-500 inline-block shrink-0" />
              <span className="text-slate-300">{lang === 'mr' ? 'अतिधोकादायक (>५० सेमी)' : 'Impassable (>50cm)'}</span>
            </span>
            <span className="text-red-300 font-mono-code shrink-0">CLOSED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
