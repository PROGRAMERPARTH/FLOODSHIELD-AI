import React from 'react';
import { X, PhoneCall, AlertOctagon, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'mr';
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const helplines = [
    {
      name: 'All-India National Emergency',
      nameMarathi: 'अखिल भारतीय आपत्कालीन सेवा',
      number: '112',
      desc: 'Police, Ambulance & Fire unified response',
      descMarathi: 'पोलीस, रुग्णवाहिका व अग्निशामक दल एकात्मिक सेवा',
      primary: true,
    },
    {
      name: 'Pune Municipal Disaster Cell',
      nameMarathi: 'पुणे महापालिका आपत्ती नियंत्रण कक्ष',
      number: '020-25501269',
      desc: 'Dewatering pumps, tree fall, underpass rescue',
      descMarathi: 'पाण्याचा उपसा, झाडे पडणे, भुयारी मार्ग सुटका',
      primary: true,
    },
    {
      name: 'Pune Fire Brigade Headquarters',
      nameMarathi: 'पुणे मुख्य अग्निशामक दल',
      number: '101',
      desc: 'Life rescue, rubber boats, flash flood extraction',
      descMarathi: 'रबर बोट व पुरात अडकलेल्या नागरिकांची सुटका',
      primary: false,
    },
    {
      name: 'NDRF Pune (Talegaon Base)',
      nameMarathi: 'एनडीआरएफ ५ वी बटालियन पुणे',
      number: '020-27171120',
      desc: 'National Disaster Response Force tactical team',
      descMarathi: 'राष्ट्रीय आपत्ती प्रतिसाद दल विशेष पथक',
      primary: false,
    },
    {
      name: 'Pune Traffic Control Room',
      nameMarathi: 'पुणे वाहतूक नियंत्रण शाखा',
      number: '020-26685000',
      desc: 'Live road closures & diversion guidance',
      descMarathi: 'रस्ते बंदी व वाहतूक वळवण्याबाबत माहिती',
      primary: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-red-600/80 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-red-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/40">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white font-marathi">
                {lang === 'mr' ? '🚨 तात्काळ आपत्कालीन संपर्क व बचाव कक्ष' : '🚨 Emergency SOS & Flood Rescue Directory'}
              </h2>
              <p className="text-xs text-red-300">
                {lang === 'mr'
                  ? 'पुणे शहर व नदीकाठच्या पूरग्रस्त नागरिकांसाठी २४x७ २४ तास हेल्पलाईन'
                  : '24x7 Direct Helplines for Pune Municipal Corporation & Disaster Relief'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advisory Tips */}
        <div className="my-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-red-300 font-marathi">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            <span>{lang === 'mr' ? 'महत्त्वाची सुरक्षा मार्गदर्शक तत्त्वे:' : 'Immediate Flood Survival Protocol:'}</span>
          </div>
          <ul className="text-[11px] space-y-0.5 pl-5 list-disc text-slate-300">
            <li>{lang === 'mr' ? 'चालू पाण्यातून (सायलेन्सर बुडत असल्यास) दुचाकी चालवण्याचा प्रयत्न करू नका.' : 'Never attempt to drive through moving water (>20cm stalls most 2-wheelers).'}</li>
            <li>{lang === 'mr' ? 'पाण्याखालील मॅनहोल उघडे असण्याची शक्यता असते; रस्त्याच्या कडेने चाला.' : 'Beware of displaced manhole lids hidden beneath murky storm runoff.'}</li>
            <li>{lang === 'mr' ? 'घरातील विद्युत उपकरणे बंद करा व सुरक्षित उंच मजल्यावर आसरा घ्या.' : 'Disconnect main electrical breakers if water level enters building ground floor.'}</li>
          </ul>
        </div>

        {/* Helplines List */}
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {helplines.map((line, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                line.primary
                  ? 'bg-red-950/40 border-red-800'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div>
                <div className="font-bold text-xs text-white font-marathi">
                  {lang === 'mr' ? line.nameMarathi : line.name}
                </div>
                <div className="text-[11px] text-slate-400 font-marathi">
                  {lang === 'mr' ? line.descMarathi : line.desc}
                </div>
              </div>

              <a
                href={`tel:${line.number}`}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono-code font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{line.number}</span>
              </a>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 mt-4 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {lang === 'mr' ? 'बंद करा' : 'Close Emergency Window'}
          </button>
        </div>
      </div>
    </div>
  );
};
