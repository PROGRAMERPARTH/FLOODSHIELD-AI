import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  ShieldAlert, 
  FileText, 
  Download, 
  Send,
  Droplets,
  Building,
  Radio,
  Plus
} from 'lucide-react';
import { RoadSegment, CivicComplaint } from '../types/flood';
import { SAMPLE_CIVIC_COMPLAINTS } from '../data/sampleReports';

interface CivicActionTrackerProps {
  roadSegments: RoadSegment[];
  lang: 'en' | 'mr';
}

export const CivicActionTracker: React.FC<CivicActionTrackerProps> = ({
  roadSegments,
  lang,
}) => {
  const [complaints, setComplaints] = useState<CivicComplaint[]>(SAMPLE_CIVIC_COMPLAINTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [activePumpCount, setActivePumpCount] = useState<number>(18);
  const [showNewForm, setShowNewForm] = useState<boolean>(false);
  const [newRoadId, setNewRoadId] = useState<string>(roadSegments[0]?.id || 'sinhagad-pula-rajaram');
  const [newIssueType, setNewIssueType] = useState<CivicComplaint['type']>('waterlogging');
  const [newDepthCm, setNewDepthCm] = useState<number>(30);

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const road = roadSegments.find((r) => r.id === newRoadId) || roadSegments[0];
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const entry: CivicComplaint = {
      id: `PMC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      roadName: road ? road.name : 'Selected Pune Corridor',
      ward: road ? road.ward : 'Pune Ward',
      type: newIssueType,
      reportedAt: `${nowTime} IST`,
      status: 'open',
      depthCm: newDepthCm,
      referenceToJuly2026: false,
    };
    setComplaints((prev) => [entry, ...prev]);
    setShowNewForm(false);
    setFilterType('all');
  };

  const handleUpdateStatus = (id: string, newStatus: CivicComplaint['status']) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const filteredComplaints = filterType === 'all' 
    ? complaints 
    : complaints.filter((c) => c.status === filterType);

  // Total civic complaints context
  const totalWaterloggedRoads = roadSegments.filter((r) => r.riskLevel === 'severe' || r.riskLevel === 'impassable').length;

  const handleExportSitrep = () => {
    const sitrep = {
      agency: "Pune Municipal Corporation (PMC) Disaster Management Cell",
      benchmarkEvent: "July 2026 Monsoon Inundation (250+ Civic Complaints Archive Reference)",
      timestamp: new Date().toISOString(),
      activePumpsDeployed: activePumpCount,
      criticalRoadSegments: roadSegments
        .filter((r) => r.riskLevel !== 'safe')
        .map((r) => ({
          name: r.name,
          depthCm: r.currentWaterDepthCm,
          risk: r.riskLevel,
          ward: r.ward
        })),
      complaintsLog: complaints,
    };

    const blob = new Blob([JSON.stringify(sitrep, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PMC-Flood-Situational-Report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-100">
              {lang === 'mr' ? 'पुणे महापालिका आपत्ती निवारण व तक्रार नियंत्रण' : 'PMC Civic Flood Operations & July 2026 Action Cell'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'mr'
                ? 'जुलै २०२६ च्या २५० हून अधिक तक्रारींवर आधारित उपसा पंप व मॅनहोल सुरक्षा व्यवस्थापन'
                : 'Civic waterlogging response tracking, pump deployments, & July 2026 historical benchmark reconciliation'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'नवीन तक्रार नोंदवा' : 'Log Civic Complaint'}</span>
          </button>

          <button
            onClick={handleExportSitrep}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'mr' ? 'आपत्ती अहवाल डाउनलोड (SITREP)' : 'Export Civic SITREP (JSON)'}</span>
          </button>
        </div>
      </div>

      {showNewForm && (
        <form onSubmit={handleCreateComplaint} className="bg-slate-950 border border-blue-800/70 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {lang === 'mr' ? 'रस्ता / ठिकाण:' : 'Affected Road:'}
            </label>
            <select
              value={newRoadId}
              onChange={(e) => setNewRoadId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              {roadSegments.map((r) => (
                <option key={r.id} value={r.id}>{lang === 'mr' ? r.nameMarathi : r.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {lang === 'mr' ? 'तक्रारीचा प्रकार:' : 'Issue Type:'}
            </label>
            <select
              value={newIssueType}
              onChange={(e) => setNewIssueType(e.target.value as CivicComplaint['type'])}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              <option value="waterlogging">Waterlogging</option>
              <option value="open_manhole">Open Manhole</option>
              <option value="drain_choked">Choked Storm Drain</option>
              <option value="fallen_tree">Fallen Tree</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {lang === 'mr' ? 'पाणी (सेमी):' : 'Depth (cm):'}
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={newDepthCm}
              onChange={(e) => setNewDepthCm(parseInt(e.target.value) || 15)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              {lang === 'mr' ? 'नोंदवा' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      )}

      {/* July 2026 Pune Benchmark Banner */}
      <div className="bg-gradient-to-r from-red-950/60 via-slate-950 to-blue-950/40 border border-red-900/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'द टाइम्स ऑफ इंडिया संदर्भ: जुलै २०२६ पूर आपत्ती' : 'The Times of India Reference: July 2026 Civic Impact'}</span>
          </div>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            {lang === 'mr'
              ? 'जुलै २०२६ च्या मुसळधार पावसात पुण्यात सुमारे २५० नागरी तक्रारी दाखल झाल्या होत्या. पाणी तुंबणे, आंबिल ओढा फुटणे आणि खडकवासला विसर्गामुळे रस्ते ठप्प झाले होते.'
              : 'Pune recorded approx 250 civic complaints after extreme rainfall in July 2026, causing widespread waterlogging at underpasses, Mutha riverbank breaches, and infrastructure gridlock.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase">2026 Complaints</div>
            <div className="font-mono-code font-black text-xl text-red-400">250+</div>
          </div>
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase">Active Pumps</div>
            <div className="font-mono-code font-black text-xl text-cyan-400">{activePumpCount}</div>
          </div>
        </div>
      </div>

      {/* Operational Response Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Critical Roads</div>
          <div className="font-mono-code font-bold text-xl text-red-400 mt-1">{totalWaterloggedRoads} Corridors</div>
          <div className="text-[10px] text-slate-500 mt-0.5">&gt;25cm Inundation</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Suction Pumps</div>
          <div className="font-mono-code font-bold text-xl text-cyan-400 mt-1">{activePumpCount} Dispatched</div>
          <div className="text-[10px] text-slate-500 mt-0.5">50 HP High Flow</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Police Barricades</div>
          <div className="font-mono-code font-bold text-xl text-amber-400 mt-1">6 Roadblocks</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Swargate / Station Underpass</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-semibold">Culverts Cleared</div>
          <div className="font-mono-code font-bold text-xl text-emerald-400 mt-1">42 Nullah Grates</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Silt & Debris Removed</div>
        </div>
      </div>

      {/* Complaints Management Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold text-xs text-slate-200">
            {lang === 'mr' ? 'नागरिक तक्रार नोंदवही (Live Complaints Log):' : 'Citizen Waterlogging & Drainage Complaints:'}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              All ({complaints.length})
            </button>
            <button
              onClick={() => setFilterType('open')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${filterType === 'open' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterType('pump_dispatched')}
              className={`px-2 py-1 rounded text-[11px] font-medium ${filterType === 'pump_dispatched' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
            >
              Pump Active
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {filteredComplaints.map((c) => (
            <div key={c.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/50 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-bold text-cyan-400 text-[11px]">{c.id}</span>
                  <span className="font-semibold text-slate-200">{c.roadName}</span>
                  <span className="text-slate-400 text-[11px]">({c.ward})</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Type: <strong className="text-slate-300 capitalize">{c.type.replace('_', ' ')}</strong></span>
                  <span>·</span>
                  <span>Depth: <strong className="text-amber-400">{c.depthCm} cm</strong></span>
                  <span>·</span>
                  <span>{c.reportedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  c.status === 'pump_dispatched' 
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : c.status === 'resolved'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {c.status.replace('_', ' ')}
                </span>

                {c.status === 'open' && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(c.id, 'pump_dispatched');
                      setActivePumpCount((prev) => prev + 1);
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold cursor-pointer"
                  >
                    Dispatch Pump
                  </button>
                )}

                {c.status === 'pump_dispatched' && (
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'resolved')}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
