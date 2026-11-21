import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  Bike, 
  Truck, 
  Footprints, 
  Loader2,
  MapPin,
  Camera
} from 'lucide-react';
import { RoadSegment, CitizenReport } from '../types/flood';
import { SAMPLE_CITIZEN_REPORTS } from '../data/sampleReports';

interface CitizenUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadSegments: RoadSegment[];
  onAddReport: (newReport: CitizenReport, updatedDepthCm: number) => void;
  initialRoadId?: string | null;
  lang: 'en' | 'mr';
}

export const CitizenUploadModal: React.FC<CitizenUploadModalProps> = ({
  isOpen,
  onClose,
  roadSegments,
  onAddReport,
  initialRoadId,
  lang,
}) => {
  const [selectedRoadId, setSelectedRoadId] = useState<string>(initialRoadId || roadSegments[0]?.id || 'sinhagad-pula-rajaram');
  const [imagePreview, setImagePreview] = useState<string | null>(SAMPLE_CITIZEN_REPORTS[0].imageUrl);
  const [reporterName, setReporterName] = useState<string>('Priya Kulkarni');
  const [userDepthCm, setUserDepthCm] = useState<number>(35);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<CitizenReport['aiAnalysis'] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialRoadId) {
      setSelectedRoadId(initialRoadId);
      setAiResult(null);
      setErrorMsg(null);
    }
  }, [isOpen, initialRoadId]);

  if (!isOpen) return null;

  const selectedRoad = roadSegments.find((r) => r.id === selectedRoadId);

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setAiResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Quick preset selector
  const handleSelectPreset = (index: number) => {
    const preset = SAMPLE_CITIZEN_REPORTS[index];
    if (preset) {
      setImagePreview(preset.imageUrl);
      setSelectedRoadId(preset.roadSegmentId);
      setUserDepthCm(preset.userEstimatedDepthCm);
      setAiResult(null);
      setErrorMsg(null);
    }
  };

  const rasterizeIfSvg = (dataUrl: string): Promise<{ base64: string; mimeType: string }> => {
    if (!dataUrl.startsWith('data:image/svg+xml')) {
      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      return Promise.resolve({ base64: dataUrl, mimeType: match ? match[1] : 'image/jpeg' });
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 600;
        canvas.height = img.height || 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not initialize image canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ base64: canvas.toDataURL('image/png'), mimeType: 'image/png' });
      };
      img.onerror = () => reject(new Error('Failed to render flood preset image'));
      img.src = dataUrl;
    });
  };

  // Run AI Vision Analysis
  const handleRunAiAnalysis = async () => {
    if (!imagePreview) {
      setErrorMsg('Please select or upload a flood photo first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const prepared = await rasterizeIfSvg(imagePreview);
      const response = await fetch('/api/gemini/analyze-flood-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: prepared.base64,
          mimeType: prepared.mimeType,
          locationName: selectedRoad?.name || 'Pune Urban Road',
          roadSegmentId: selectedRoadId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.analysis) {
        throw new Error(data.error || 'Failed to complete vision analysis');
      }
      setAiResult(data.analysis);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error communicating with AI vision service';
      setErrorMsg(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit and commit report
  const handleConfirmReport = () => {
    const depthToUse = aiResult ? aiResult.estimatedDepthCm : userDepthCm;
    const finalReport: CitizenReport = {
      id: `rep-${Date.now()}`,
      roadSegmentId: selectedRoadId,
      roadName: selectedRoad?.name || 'Selected Road Segment',
      roadNameMarathi: selectedRoad?.nameMarathi || 'निवडलेला रस्ता',
      location: selectedRoad?.coordinates[1] || [18.514, 73.845],
      timestamp: 'Just now (AI Verified)',
      reportedBy: reporterName || 'Pune Citizen',
      imageUrl: imagePreview || '',
      userEstimatedDepthCm: userDepthCm,
      aiVerified: !!aiResult,
      aiAnalysis: aiResult || undefined,
      status: 'verified',
    };

    onAddReport(finalReport, depthToUse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-slate-100">
                {lang === 'mr' ? 'पाण्याचा फोटो अपलोड करा व AI द्वारे खोली मोजा' : 'Citizen Flood Photo & AI Depth Analyzer'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'mr'
                  ? 'फोटोवरून कृत्रिम बुद्धिमत्ता चाके, कठडे व सायलेन्सरच्या पातळीवरून पाण्याची खोली मोजते'
                  : 'AI inspects physical benchmarks (wheel rims, curbs, exhaust level) to calculate road accessibility'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          {/* Left Column: Image Selection & Inputs */}
          <div className="space-y-4">
            {/* Quick Test Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {lang === 'mr' ? 'त्वरित चाचणीसाठी फोटो निवडा:' : 'Instant Monsoon Test Scenarios:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {SAMPLE_CITIZEN_REPORTS.map((preset, idx) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-left transition-colors cursor-pointer truncate"
                  >
                    <div className="font-semibold text-slate-200 truncate">
                      {preset.roadName.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-cyan-400">
                      {preset.userEstimatedDepthCm}cm Depth Preset
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom File Upload Box */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'mr' ? 'किंवा स्वतःचा फोटो निवडा:' : 'Or Upload Live Photo / Camera Capture:'}
              </label>
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-950/40 transition-colors">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-slate-300">
                  {lang === 'mr' ? 'फोटो अपलोड करण्यासाठी येथे क्लिक करा' : 'Click to select photo or take picture'}
                </span>
                <span className="text-[10px] text-slate-500">JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Image Preview Box */}
            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                <img
                  src={imagePreview}
                  alt="Flood preview"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/90 backdrop-blur px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono-code border border-slate-700">
                  {selectedRoad?.name || 'Pune Urban Segment'}
                </div>
              </div>
            )}

            {/* Road Location Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'mr' ? 'रस्ता / स्थळ निवडा:' : 'Affected Road Corridor:'}</span>
              </label>
              <select
                value={selectedRoadId}
                onChange={(e) => setSelectedRoadId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {roadSegments.map((r) => (
                  <option key={r.id} value={r.id}>
                    {lang === 'mr' ? `${r.nameMarathi} (${r.wardMarathi})` : `${r.name} (${r.ward})`}
                  </option>
                ))}
              </select>
            </div>

            {/* User Depth Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{lang === 'mr' ? 'तुमचा अंदाज (खोली):' : 'Your Depth Estimate:'}</span>
                <span className="font-mono-code font-bold text-cyan-400">{userDepthCm} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={userDepthCm}
                onChange={(e) => setUserDepthCm(parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Reporter Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {lang === 'mr' ? 'नोंदवणाऱ्याचे नाव:' : 'Citizen Name / Ward Rep:'}
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Citizen Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Trigger AI Button */}
            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{lang === 'mr' ? 'AI द्वारे फोटोची पाहणी सुरू आहे...' : 'Analyzing Visual Anchors with AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>{lang === 'mr' ? 'AI द्वारे पाण्याची अचूक खोली तपासा' : 'Verify Depth with Gemini Multimodal AI'}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Analysis Telemetry Output */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            {errorMsg && (
              <div className="bg-red-950/60 border border-red-800/80 rounded-lg p-3 text-xs text-red-300 mb-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {aiResult ? (
              <div className="space-y-3.5">
                {/* Result Title & Depth Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      AI Verified Telemetry
                    </div>
                    <div className="font-extrabold text-2xl text-white font-mono-code flex items-baseline gap-1">
                      {aiResult.estimatedDepthCm} <span className="text-sm font-normal text-slate-400">cm</span>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${
                    aiResult.depthCategory === 'critical'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : aiResult.depthCategory === 'severe'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {aiResult.depthCategory} Hazard
                  </div>
                </div>

                {/* Detected Physical Benchmarks */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'mr' ? 'फोटोतील दृश्य पुरावे (Physical Anchors):' : 'Identified Depth Indicators:'}</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300/90 pl-2">
                    {aiResult.depthVisualIndicators.map((indicator, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vehicle Accessibility Matrix */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-300 mb-1.5">
                    {lang === 'mr' ? 'वाहन प्रवेशक्षमता (Vehicle Passability):' : 'Vehicle Accessibility Matrix:'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Bike className="w-3.5 h-3.5 text-slate-400" />
                        <span>2-Wheelers</span>
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        aiResult.accessibility.twoWheeler === 'Safe' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                      }`}>
                        {aiResult.accessibility.twoWheeler}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hatchback</span>
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        aiResult.accessibility.hatchback === 'Safe' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                      }`}>
                        {aiResult.accessibility.hatchback}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>SUV / Bus</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">
                        {aiResult.accessibility.suv}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Footprints className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pedestrian</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300">
                        {aiResult.accessibility.pedestrian}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Marathi & English Summary */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                  <div className="text-slate-200 text-[11px] font-marathi">
                    {aiResult.aiObservationSummaryMarathi}
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {aiResult.aiObservationSummary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
                <div className="font-semibold text-slate-300 text-xs mb-1">
                  {lang === 'mr' ? 'AI द्वारे फोटो तपासणी बाकी आहे' : 'Awaiting Visual Analysis'}
                </div>
                <div className="text-[11px] text-slate-500 max-w-xs">
                  {lang === 'mr'
                    ? 'डावीकडील "AI द्वारे पाण्याची अचूक खोली तपासा" या बटणावर क्लिक करा.'
                    : 'Click "Verify Depth with Gemini Multimodal AI" to detect tyre submersion, curbs, and road risks.'}
                </div>
              </div>
            )}

            {/* Submit to Live Map Button */}
            <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReport}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {lang === 'mr' ? 'नकाशावर जोडा व रस्ता अपडेट करा' : 'Pin to Public Map & Update Road'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
