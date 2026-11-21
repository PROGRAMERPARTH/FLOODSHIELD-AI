import { CitizenReport, CivicComplaint } from '../types/flood';

// Realistic inline SVG base64 scenes representing monsoon flooded streets for instant preview & AI testing
const createFloodSvgDataUrl = (waterLevelPct: number, colorScheme: string, roadText: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#334155" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="floodWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#475569" stop-opacity="0.85" />
        <stop offset="60%" stop-color="#334155" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <pattern id="rain" width="20" height="20" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="10" y2="20" stroke="#94a3b8" stroke-width="1.2" opacity="0.4" />
      </pattern>
    </defs>
    <!-- Dark monsoon sky -->
    <rect width="600" height="400" fill="url(#sky)" />
    <!-- City Skyline Silhouette -->
    <rect x="40" y="120" width="80" height="130" fill="#1e293b" />
    <rect x="140" y="90" width="100" height="160" fill="#0f172a" />
    <rect x="260" y="140" width="70" height="110" fill="#1e293b" />
    <rect x="350" y="100" width="110" height="150" fill="#0f172a" />
    <rect x="480" y="130" width="90" height="120" fill="#1e293b" />
    
    <!-- Road Surface Background -->
    <polygon points="0,250 600,250 600,400 0,400" fill="#090d16" />
    
    <!-- Submerged Vehicle Outline (Motorcycle/Car) -->
    <circle cx="220" cy="300" r="34" fill="#111827" stroke="#64748b" stroke-width="4" />
    <circle cx="340" cy="300" r="34" fill="#111827" stroke="#64748b" stroke-width="4" />
    <rect x="180" y="240" width="200" height="45" rx="10" fill="#3b82f6" opacity="0.9" />
    <polygon points="210,240 240,200 320,200 350,240" fill="#60a5fa" opacity="0.7" />
    
    <!-- Street Light & Sign -->
    <line x1="480" y1="120" x2="480" y2="330" stroke="#94a3b8" stroke-width="6" />
    <rect x="440" y="150" width="80" height="30" rx="4" fill="#f59e0b" />
    <text x="480" y="170" fill="#000" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">CAUTION</text>

    <!-- Rising Murky Floodwater Layer -->
    <rect x="0" y="${400 - (waterLevelPct * 2.2)}" width="600" height="${waterLevelPct * 2.2}" fill="url(#floodWater)" />
    <!-- Water Ripple lines -->
    <ellipse cx="280" cy="${400 - (waterLevelPct * 2.2) + 10}" rx="180" ry="12" fill="none" stroke="#64748b" stroke-width="2" opacity="0.6" />
    <ellipse cx="220" cy="${400 - (waterLevelPct * 2.2) + 22}" rx="70" ry="6" fill="none" stroke="#94a3b8" stroke-width="1.5" opacity="0.7" />
    <ellipse cx="340" cy="${400 - (waterLevelPct * 2.2) + 20}" rx="80" ry="7" fill="none" stroke="#94a3b8" stroke-width="1.5" opacity="0.7" />
    
    <!-- Rain overlay -->
    <rect width="600" height="400" fill="url(#rain)" pointer-events="none" />
    
    <!-- Watermark / Location stamp -->
    <rect x="16" y="16" width="360" height="48" rx="8" fill="#0f172a" opacity="0.85" />
    <text x="30" y="36" fill="#f8fafc" font-size="13" font-weight="bold" font-family="sans-serif">${roadText}</text>
    <text x="30" y="52" fill="#ef4444" font-size="11" font-weight="600" font-family="sans-serif">● FLOOD RECORDER: ~${Math.round(waterLevelPct * 0.75)}cm INUNDATION</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SAMPLE_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'rep-sinhagad-01',
    roadSegmentId: 'sinhagad-pula-rajaram',
    roadName: 'Sinhagad Road (Near Pu La Deshpande Garden)',
    roadNameMarathi: 'सिंहगड रस्ता (पु.ल. देशपांडे उद्यान परिसर)',
    location: [18.4915, 73.8321],
    timestamp: '12 mins ago (16:42 IST)',
    reportedBy: 'Kunal Deshmukh (Resident, Manik Baug)',
    imageUrl: createFloodSvgDataUrl(58, '#ef4444', 'Sinhagad Road / Pu La Garden'),
    userEstimatedDepthCm: 45,
    aiVerified: true,
    aiAnalysis: {
      estimatedDepthCm: 44,
      depthCategory: 'severe',
      confidenceScore: 0.94,
      depthVisualIndicators: [
        'Water level covers 85% of car wheel rims and reaches motorcycle exhaust mufflers',
        'Curbstone along footpath completely drowned',
        'Muddy turbulence indicates river backflow surge'
      ],
      accessibility: {
        twoWheeler: 'Impassable',
        hatchback: 'Impassable',
        suv: 'Caution',
        pedestrian: 'Impassable'
      },
      hazards: [
        'High likelihood of open drainage manholes near bus stop',
        'Engine hydraulic lock guaranteed for low-slung cars',
        'Strong lateral undercurrent towards river bank'
      ],
      urgencyLevel: 'HIGH',
      aiObservationSummary: 'Severe inundation at 44cm depth. Two-wheelers and passenger hatchbacks cannot navigate without total engine failure. Barricades required.',
      aiObservationSummaryMarathi: '४४ सेमी खोल पाणी साचले आहे. दुचाकी व लहान गाड्यांचे इंजिन बंद पडण्याची खात्रीशीर शक्यता आहे. नागरिकांनी हा मार्ग पूर्णपणे टाळावा.'
    },
    status: 'action_dispatched'
  },
  {
    id: 'rep-alka-02',
    roadSegmentId: 'alka-talkies-deccan',
    roadName: 'Alka Talkies Chowk & Z-Bridge Corner',
    roadNameMarathi: 'अलका टॉकीज चौक व झेड-ब्रिज कोपरा',
    location: [18.5142, 73.8455],
    timestamp: '28 mins ago (16:26 IST)',
    reportedBy: 'Anjali Phadke (Commuter)',
    imageUrl: createFloodSvgDataUrl(50, '#f59e0b', 'Alka Talkies / Deccan'),
    userEstimatedDepthCm: 35,
    aiVerified: true,
    aiAnalysis: {
      estimatedDepthCm: 38,
      depthCategory: 'severe',
      confidenceScore: 0.91,
      depthVisualIndicators: [
        'Water submerged entire footboard of standard Honda Activa scooter',
        'Shop plinths on ground floor receiving wave splashes',
        'Divider curbs invisible under murky runoff'
      ],
      accessibility: {
        twoWheeler: 'Impassable',
        hatchback: 'Impassable',
        suv: 'Caution',
        pedestrian: 'Caution'
      },
      hazards: [
        'Floating commercial plastic crates & debris',
        'Vehicles breaking down creating multi-lane logjam'
      ],
      urgencyLevel: 'HIGH',
      aiObservationSummary: '38cm water depth at junction. Severe threat to two-wheeler commuters. Diverting traffic towards Prabhat Road / Law College Road.',
      aiObservationSummaryMarathi: 'चौकात ३८ सेमी पाणी साचले आहे. दुचाकींचे सायलेन्सर बुडत आहेत. वाहतूक प्रभात रस्ता व लॉ कॉलेज रस्त्याकडे वळवण्यात आली आहे.'
    },
    status: 'verified'
  },
  {
    id: 'rep-swargate-03',
    roadSegmentId: 'swargate-jedhe-underpass',
    roadName: 'Swargate Underpass (Jedhe Chowk Sub-Canal)',
    roadNameMarathi: 'स्वारगेट भुयारी मार्ग (जेधे चौक)',
    location: [18.5022, 73.8585],
    timestamp: '45 mins ago (16:09 IST)',
    reportedBy: 'Rohan Shinde (Traffic Volunteer)',
    imageUrl: createFloodSvgDataUrl(70, '#991b1b', 'Swargate Subway Depression'),
    userEstimatedDepthCm: 55,
    aiVerified: true,
    aiAnalysis: {
      estimatedDepthCm: 52,
      depthCategory: 'critical',
      confidenceScore: 0.96,
      depthVisualIndicators: [
        'Underpass lowest dip submerged past waist level (>50cm)',
        'PMC warning barrier flooded up to reflective stripe',
        'Pumps overwhelmed by Ambil Odha flash surge'
      ],
      accessibility: {
        twoWheeler: 'Impassable',
        hatchback: 'Impassable',
        suv: 'Impassable',
        pedestrian: 'Impassable'
      },
      hazards: [
        'ROAD CLOSED by Traffic Police',
        'Submerged electrical inspection box',
        'Risk of vehicle buoyancy / floating'
      ],
      urgencyLevel: 'CRITICAL',
      aiObservationSummary: 'CRITICAL INUNDATION (52cm). Underpass closed to all vehicular traffic. 2 high-capacity suction pumps deployed by PMC.',
      aiObservationSummaryMarathi: 'अत्यंत गंभीर स्थिती (५२ सेमी पाणी)! भुयारी मार्ग सर्व प्रकारच्या वाहतुकीसाठी बंद. महापालिकेकडून उपसा पंप कार्यरत.'
    },
    status: 'action_dispatched'
  },
  {
    id: 'rep-karve-04',
    roadSegmentId: 'karve-road-paud',
    roadName: 'Karve Road (Near Garware College)',
    roadNameMarathi: 'कर्वे रस्ता (गरवारे कॉलेज जवळ)',
    location: [18.5085, 73.8340],
    timestamp: '1 hour ago (15:50 IST)',
    reportedBy: 'Snehal Joshi',
    imageUrl: createFloodSvgDataUrl(20, '#10b981', 'Karve Road / Garware'),
    userEstimatedDepthCm: 15,
    aiVerified: true,
    aiAnalysis: {
      estimatedDepthCm: 14,
      depthCategory: 'moderate',
      confidenceScore: 0.89,
      depthVisualIndicators: [
        'Water limited to curb-side channel, center lanes largely drained',
        'Depth below car rims (~14cm on leftmost lane)',
        'Drain grates operating at 70% capacity'
      ],
      accessibility: {
        twoWheeler: 'Caution',
        hatchback: 'Safe',
        suv: 'Safe',
        pedestrian: 'Safe'
      },
      hazards: ['Splashing water on pedestrians', 'Slippery lane markings'],
      urgencyLevel: 'MEDIUM',
      aiObservationSummary: 'Moderate curb ponding of 14cm. Passable with reduced speed. Center carriageway open.',
      aiObservationSummaryMarathi: 'रस्त्याच्या कडेला १४ सेमी पाणी. मध्यभागातून वाहतूक सुरू आहे. हळू चालवल्यास सुरक्षित.'
    },
    status: 'verified'
  }
];

export const SAMPLE_CIVIC_COMPLAINTS: CivicComplaint[] = [
  {
    id: 'PMC-2026-0812',
    roadName: 'Sinhagad Road near Pu La Deshpande Garden',
    ward: 'Ward 19',
    type: 'waterlogging',
    reportedAt: '16:30 IST',
    status: 'pump_dispatched',
    depthCm: 44,
    referenceToJuly2026: true
  },
  {
    id: 'PMC-2026-0814',
    roadName: 'Swargate Underpass',
    ward: 'Ward 18',
    type: 'waterlogging',
    reportedAt: '16:15 IST',
    status: 'pump_dispatched',
    depthCm: 52,
    referenceToJuly2026: true
  },
  {
    id: 'PMC-2026-0818',
    roadName: 'Alka Talkies / Sambhaji Bridge road',
    ward: 'Ward 12',
    type: 'open_manhole',
    reportedAt: '16:22 IST',
    status: 'open',
    depthCm: 38,
    referenceToJuly2026: true
  },
  {
    id: 'PMC-2026-0820',
    roadName: 'Ambil Odha culvert, Dandekar Bridge',
    ward: 'Ward 17',
    type: 'drain_choked',
    reportedAt: '15:45 IST',
    status: 'pump_dispatched',
    depthCm: 48,
    referenceToJuly2026: true
  },
  {
    id: 'PMC-2026-0825',
    roadName: 'Pune Railway Station Maldhakka Subway',
    ward: 'Ward 14',
    type: 'waterlogging',
    reportedAt: '16:10 IST',
    status: 'open',
    depthCm: 41,
    referenceToJuly2026: true
  },
  {
    id: 'PMC-2026-0831',
    roadName: 'Hinjawadi Phase 1 Wipro Circle',
    ward: 'IT Zone',
    type: 'drain_choked',
    reportedAt: '16:05 IST',
    status: 'open',
    depthCm: 26,
    referenceToJuly2026: false
  }
];
