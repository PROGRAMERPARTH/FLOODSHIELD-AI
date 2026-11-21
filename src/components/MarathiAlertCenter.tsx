import React, { useState } from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  PhoneCall, 
  Send, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { RoadSegment, MarathiAlertData } from '../types/flood';

interface MarathiAlertCenterProps {
  roadSegments: RoadSegment[];
  initialRoadId?: string | null;
  lang: 'en' | 'mr';
}

export const MarathiAlertCenter: React.FC<MarathiAlertCenterProps> = ({
  roadSegments,
  initialRoadId,
  lang,
}) => {
  const [selectedRoadId, setSelectedRoadId] = useState<string>(initialRoadId || 'sinhagad-pula-rajaram');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialRoadId) {
      setSelectedRoadId(initialRoadId);
    }
  }, [initialRoadId]);

  const selectedRoad = roadSegments.find((r) => r.id === selectedRoadId) || roadSegments[0];

  // Default active Marathi Alert
  const [activeAlert, setActiveAlert] = useState<MarathiAlertData>({
    alertTitleMarathi: `🚨 पुणे महापालिका पूर इशारा: सिंहगड रस्ता जलमय`,
    alertTitleEnglish: `🚨 PMC Flood Advisory: Severe Waterlogging on Sinhagad Road`,
    marathiMessage: `पुणे आपत्ती व्यवस्थापन कक्ष: सिंहगड रस्ता (पु.ल. देशपांडे उद्यान ते राजाराम पूल) येथे मुसळधार पावसामुळे अंदाजे ४४ सेमी पाणी साचले आहे. दुचाकी व कार चालकांनी डेक्कन मार्गे जाणे टाळावे. मुठा नदीपात्रातून पाण्याचा उलटा प्रवाह सुरू असल्याने सायलेन्सर बुडण्याचा गंभीर धोका आहे.`,
    englishMessage: `PMC Disaster Cell Advisory: Severe waterlogging of approx 44cm recorded on Sinhagad Road (Pu La Deshpande to Rajaram Bridge). Two-wheelers and cars are strictly advised to avoid this corridor due to river backflow and engine flooding hazards.`,
    safeRouteMarathi: `पर्यायी सुरक्षित मार्ग: आनंद नगर चौकातून डावीकडे वळून लॉ कॉलेज रोड आणि सेनापती बापट मार्ग उंच उड्डाणपुलाचा वापर करावा.`,
    safeRouteEnglish: `Recommended Safe Alternate: Divert at Anand Nagar Chowk toward Law College Road and Senapati Bapat Road elevated flyover.`,
    wardName: 'सिंहगड रस्ता प्रभाग १९ (Sinhagad Road Ward 19)',
    timestamp: 'तात्काळ broadcast (Immediate Broadcast)',
    emergencyHelplines: [
      { nameMarathi: 'पुणे महापालिका पूर नियंत्रण कक्ष', name: 'PMC Flood Control Room', number: '020-25501269' },
      { nameMarathi: 'अग्निशामक दल आपत्कालीन', name: 'Pune Fire Brigade', number: '101' },
      { nameMarathi: 'पोलीस नियंत्रण कक्ष', name: 'Police Emergency Helpline', number: '112' },
      { nameMarathi: 'एनडीआरएफ पुणे तळ', name: 'NDRF Pune Station', number: '020-27171120' },
    ],
    audioAnnouncementScriptMarathi: `लक्ष द्या! पुणे महानगरपालिका आपत्ती व्यवस्थापन विभागाकडून महत्त्वाची सूचना. सिंहगड रस्ता परिसरात मुसळधार पावसामुळे रस्ता जलमय झाला असून पाणी पातळी ४४ सेंटीमीटरवर पोहोचली आहे. वाहनचालकांनी तात्काळ लॉ कॉलेज रोड या पर्यायी मार्गाचा वापर करावा!`
  });

  // Call Server Gemini Marathi Alert Generator
  const handleGenerateAlert = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/gemini/generate-marathi-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadName: selectedRoad.name,
          waterDepthCm: selectedRoad.currentWaterDepthCm,
          riskLevel: selectedRoad.riskLevel,
          alternateRoute: selectedRoad.safeAlternativeName || 'Law College Road Ridge',
          wardName: selectedRoad.ward,
          rainfallMmHr: 48,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.alert) {
        throw new Error(data.error || 'Failed to generate Marathi alert.');
      }

      setActiveAlert({
        ...data.alert,
        wardName: selectedRoad.wardMarathi,
        timestamp: 'Just now (AI Generated)',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to reach alert generation service.';
      setErrorMsg(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Play Marathi Speech Announcement
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = activeAlert.audioAnnouncementScriptMarathi || activeAlert.marathiMessage;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Attempt to set Marathi or Hindi Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const marathiVoice = voices.find((v) => v.lang === 'mr-IN' || v.lang.startsWith('mr')) ||
                         voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
    if (marathiVoice) {
      utterance.voice = marathiVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const whatsappMessage = `*${activeAlert.alertTitleMarathi}*\n\n${activeAlert.marathiMessage}\n\n*${activeAlert.safeRouteMarathi}*\n\n📞 आपत्कालीन मदत:\n• महापालिका पूर नियंत्रण: 020-25501269\n• आपत्कालीन: 112\n\n_FloodShield AI - पुणे महापालिका आपत्ती कक्ष_`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-slate-100 font-marathi">
              {lang === 'mr' ? 'स्थानिक मराठी आपत्कालीन सूचना केंद्र' : 'Hyperlocal Marathi Emergency Alert Center'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'mr'
                ? 'प्रभाग व रस्ता स्तरावर नागरिकांसाठी अधिकृत व्हॉट्सॲप, एसएमएस व ध्वनिक्षेपक मराठी संदेश'
                : 'Ward-level official Marathi alerts formatted for citizen WhatsApp groups, SMS broadcasts, & audio sirens'}
            </p>
          </div>
        </div>

        {/* Generate with AI Button */}
        <button
          onClick={handleGenerateAlert}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{lang === 'mr' ? 'मराठी संदेश तयार होत आहे...' : 'Generating Localized Alert...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{lang === 'mr' ? 'नवीन मराठी इशारा तयार करा' : 'Generate Marathi Alert with AI'}</span>
            </>
          )}
        </button>
      </div>

      {/* Corridor & Ward Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            {lang === 'mr' ? 'ज्या रस्त्यासाठी इशारा द्यायचा आहे तो निवडा:' : 'Select Target Road Corridor:'}
          </label>
          <select
            value={selectedRoadId}
            onChange={(e) => setSelectedRoadId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {roadSegments.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nameMarathi} ({r.currentWaterDepthCm}cm) - {r.wardMarathi}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'पाण्याची सद्यस्थिती:' : 'Current Inundation:'}</div>
            <div className="font-bold text-amber-400 font-mono-code text-base">
              {selectedRoad.currentWaterDepthCm} cm ({selectedRoad.riskLevel.toUpperCase()})
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">{lang === 'mr' ? 'मुठा नदी / नाल्यापासून अंतर:' : 'Nullah Proximity:'}</div>
            <div className="font-semibold text-slate-200 font-mono-code">
              {selectedRoad.proximityToWaterbodyM} meters
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3 text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Marathi Alert Broadcast Card */}
      <div className="bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-2 border-amber-600/70 rounded-2xl p-4 sm:p-5 shadow-2xl relative space-y-4">
        {/* Ticker Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h3 className="font-bold text-sm sm:text-base text-amber-300 font-marathi">
              {activeAlert.alertTitleMarathi}
            </h3>
          </div>
          <span className="text-[11px] text-amber-400/90 font-mono-code bg-amber-950/90 px-2 py-0.5 rounded border border-amber-800">
            {activeAlert.timestamp}
          </span>
        </div>

        {/* Marathi Message Body */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-900/40 space-y-3">
          <p className="text-sm sm:text-base text-slate-100 font-marathi leading-relaxed">
            {activeAlert.marathiMessage}
          </p>

          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs sm:text-sm text-emerald-300 font-marathi flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{activeAlert.safeRouteMarathi}</span>
          </div>
        </div>

        {/* English Translation Toggle / Preview */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            English Parallel Dispatch
          </div>
          <div className="text-slate-300 leading-normal">
            {activeAlert.englishMessage}
          </div>
          <div className="text-cyan-400 text-[11px]">
            {activeAlert.safeRouteEnglish}
          </div>
        </div>

        {/* Action Controls: Audio Readout, WhatsApp Share, Copy SMS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          {/* Marathi Audio Readout */}
          <button
            onClick={handlePlayAudio}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{lang === 'mr' ? 'ध्वनी सूचना थांबवा' : 'Stop Marathi Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{lang === 'mr' ? 'मराठी ध्वनी घोषणा ऐका' : 'Play Marathi Voice Announcement'}</span>
              </>
            )}
          </button>

          {/* Share & Copy Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(whatsappMessage, 'whatsapp')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              {copiedKey === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'whatsapp' ? (lang === 'mr' ? 'कॉपी झाले!' : 'Copied!') : (lang === 'mr' ? 'व्हॉट्सॲप मेसेज कॉपी' : 'Copy WhatsApp Alert')}</span>
            </button>

            <button
              onClick={() => handleCopy(activeAlert.marathiMessage, 'sms')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
            >
              {copiedKey === 'sms' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{lang === 'mr' ? 'एसएमएस मजकूर' : 'Copy SMS Text'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Disaster Directory (1-Click Dial) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
        <h3 className="font-bold text-xs sm:text-sm text-slate-200 mb-3 flex items-center gap-2 font-marathi">
          <PhoneCall className="w-4 h-4 text-red-400" />
          <span>{lang === 'mr' ? 'पुणे आपत्कालीन संपर्क क्रमांक (Emergency Helplines):' : 'Official Emergency Rescue Directory:'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeAlert.emergencyHelplines.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-medium text-xs text-slate-200 font-marathi">
                  {lang === 'mr' ? item.nameMarathi : item.name}
                </div>
                <div className="font-mono-code font-bold text-red-400 text-sm mt-0.5">
                  {item.number}
                </div>
              </div>
              <a
                href={`tel:${item.number}`}
                className="w-8 h-8 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 flex items-center justify-center transition-colors"
                title={`Call ${item.number}`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
