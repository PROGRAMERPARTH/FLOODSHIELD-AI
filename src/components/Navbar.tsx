import React from 'react';
import { 
  ShieldAlert, 
  Map as MapIcon, 
  Navigation, 
  Camera, 
  Radio, 
  Activity, 
  PhoneCall, 
  CloudRain,
  Languages
} from 'lucide-react';
import { WeatherTelemetry } from '../types/flood';

interface NavbarProps {
  activeTab: 'map' | 'routes' | 'citizen-ai' | 'marathi-alerts' | 'civic-cell';
  setActiveTab: (tab: 'map' | 'routes' | 'citizen-ai' | 'marathi-alerts' | 'civic-cell') => void;
  lang: 'en' | 'mr';
  setLang: (lang: 'en' | 'mr') => void;
  weather: WeatherTelemetry;
  onOpenUpload: () => void;
  onOpenSosModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  weather,
  onOpenUpload,
  onOpenSosModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top Emergency Red-Alert Ticker */}
      <div className="bg-red-950/90 border-b border-red-800/80 px-4 py-1 text-xs flex items-center justify-between text-red-200">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold text-red-100 uppercase tracking-wide shrink-0">
            {lang === 'mr' ? '🚨 पूर दक्षता इशारा:' : '🚨 FLASH FLOOD ALERT:'}
          </span>
          <span className="truncate text-red-200/90 text-[11px] sm:text-xs">
            {lang === 'mr'
              ? 'मुठा नदी पात्र धोका पातळीजवळ · खडकवासला विसर्ग २८,४०० क्युसेक्स · सिंहगड रस्ता व स्वारगेट भुयारी मार्ग टाळा.'
              : 'Mutha river near flood warning level · Khadakwasla release 28,400 cusecs · Avoid Sinhagad Rd & Swargate Underpass.'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 shrink-0 text-[11px] font-mono-code text-red-300">
          <span>{weather.rainfallIntensityMmHr} mm/h Rain</span>
          <span>·</span>
          <span>Dam: {weather.khadakwaslaDamDischargeCusecs.toLocaleString()} cusecs</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                FLOOD<span className="text-cyan-400">SHIELD</span> <span className="text-xs bg-cyan-950 text-cyan-300 font-mono-code px-1.5 py-0.5 rounded border border-cyan-800/60">AI</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {lang === 'mr' ? 'अतिस्थानिक रस्ता पूर नियंत्रण व सुरक्षित मार्ग' : 'Hyperlocal Urban Flood Intelligence & Safe Routing'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs whitespace-nowrap">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'mr' ? 'पूर नकाशा' : 'Risk Map'}</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'mr' ? 'सुरक्षित मार्ग' : 'Safe Routes'}</span>
          </button>

          <button
            onClick={() => setActiveTab('citizen-ai')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'citizen-ai'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'mr' ? 'नागरिक फोटो AI' : 'Citizen Photo AI'}</span>
          </button>

          <button
            onClick={() => setActiveTab('marathi-alerts')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'marathi-alerts'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-marathi">{lang === 'mr' ? 'मराठी सूचना' : 'Marathi Alerts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('civic-cell')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'civic-cell'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'mr' ? 'महापालिका नियंत्रण' : 'Civic Cell'}</span>
          </button>
        </nav>

        {/* Action Controls: Report Button, SOS, Language Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Marathi / English Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 transition-colors"
            title="Toggle English / मराठी"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-marathi">{lang === 'en' ? 'मराठी' : 'English'}</span>
          </button>

          {/* Quick Citizen Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {lang === 'mr' ? 'पाण्याचा फोटो पाठवा' : 'Report Waterlogging'}
            </span>
            <span className="sm:hidden">{lang === 'mr' ? 'फोटो' : 'Report'}</span>
          </button>

          {/* Emergency SOS Callout Button */}
          <button
            onClick={onOpenSosModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-red-600/90 hover:bg-red-500 text-white shadow-md shadow-red-600/30 transition-all cursor-pointer"
            title="Emergency Rescue & PMC Disaster Contacts"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden sm:inline">SOS 112</span>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Tab Navigation Bar */}
      <div className="xl:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 px-2 py-1.5 text-[11px] overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2 py-1 rounded ${activeTab === 'map' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
        >
          {lang === 'mr' ? 'नकाशा' : 'Map'}
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-2 py-1 rounded ${activeTab === 'routes' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
        >
          {lang === 'mr' ? 'मार्ग' : 'Safe Route'}
        </button>
        <button
          onClick={() => setActiveTab('citizen-ai')}
          className={`px-2 py-1 rounded ${activeTab === 'citizen-ai' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
        >
          {lang === 'mr' ? 'फोटो AI' : 'Photo AI'}
        </button>
        <button
          onClick={() => setActiveTab('marathi-alerts')}
          className={`px-2 py-1 rounded font-marathi ${activeTab === 'marathi-alerts' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400'}`}
        >
          {lang === 'mr' ? 'मराठी सूचना' : 'Marathi Alerts'}
        </button>
        <button
          onClick={() => setActiveTab('civic-cell')}
          className={`px-2 py-1 rounded ${activeTab === 'civic-cell' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
        >
          {lang === 'mr' ? 'महापालिका' : 'Civic Cell'}
        </button>
      </div>
    </header>
  );
};
