import { RoadSegment, WaterwayChannel } from '../types/flood';

export const PUNE_CENTER: [number, number] = [18.515, 73.846];

export const PUNE_ROAD_SEGMENTS: RoadSegment[] = [
  {
    id: 'sinhagad-pula-rajaram',
    name: 'Sinhagad Road (Pu La Deshpande to Rajaram Bridge)',
    nameMarathi: 'सिंहगड रस्ता (पु.ल. देशपांडे उद्यान ते राजाराम पूल)',
    ward: 'Sinhagad Road Ward 19',
    wardMarathi: 'सिंहगड रस्ता प्रभाग १९',
    coordinates: [
      [18.4862, 73.8265],
      [18.4915, 73.8321],
      [18.4988, 73.8378],
      [18.5032, 73.8415],
    ],
    elevationMeters: 546,
    slopePercent: 0.6,
    drainCapacityM3s: 14.5,
    catchmentAreaKm2: 18.2,
    proximityToWaterbodyM: 45,
    waterbodyName: 'Mutha River Right Bank',
    historicalJuly2026PeakDepthCm: 52,
    baseElevationCategory: 'depression',
    drainageCulvertStatus: 'severely_clogged',
    currentWaterDepthCm: 44,
    riskLevel: 'severe',
    vehicleAccessibility: {
      twoWheeler: false,
      hatchback: false,
      suv: true,
      pedestrian: false,
    },
    hazards: [
      'Submerged road divider',
      'High velocity backflow from Mutha riverbank',
      'Exhaust drowning danger for 2-wheelers'
    ],
    hazardsMarathi: [
      'जलमय झालेला दुभाजक दिसत नाही',
      'मुठा नदीपात्रातून उलट प्रवाह',
      'दुचाकी वाहनांचे सायलेन्सर बुडण्याचा धोका'
    ],
    safeAlternativeRoadId: 'law-college-rd',
    safeAlternativeName: 'Law College Road - Karve Road Ridge',
    safeAlternativeNameMarathi: 'लॉ कॉलेज रोड - कर्वे रस्ता उंच मार्ग',
    activeComplaintsCount: 38,
    dewateringPumpDeployed: true,
  },
  {
    id: 'alka-talkies-deccan',
    name: 'Alka Talkies Chowk & Deccan Gymkhana (Lakdi Pul)',
    nameMarathi: 'अलका टॉकीज चौक व डेक्कन जिमखाना (लकडी पूल)',
    ward: 'Deccan-Kothrud Ward 12',
    wardMarathi: 'डेक्कन-कोथरूड प्रभाग १२',
    coordinates: [
      [18.5115, 73.8425],
      [18.5142, 73.8455],
      [18.5178, 73.8482],
    ],
    elevationMeters: 548,
    slopePercent: 0.4,
    drainCapacityM3s: 18.0,
    catchmentAreaKm2: 22.4,
    proximityToWaterbodyM: 30,
    waterbodyName: 'Mutha River / Z-Bridge Corridor',
    historicalJuly2026PeakDepthCm: 46,
    baseElevationCategory: 'valley',
    drainageCulvertStatus: 'overflowing',
    currentWaterDepthCm: 38,
    riskLevel: 'severe',
    vehicleAccessibility: {
      twoWheeler: false,
      hatchback: false,
      suv: true,
      pedestrian: false,
    },
    hazards: [
      'Sambhaji bridge approach submerged',
      'Displaced stormwater drain lids',
      'Traffic gridlock with stalled cars'
    ],
    hazardsMarathi: [
      'संभाजी पुलाचा रस्ता पाण्याखाली',
      'गटारांचे झाकण वाहून गेल्याची शक्यता',
      'वाहने बंद पडल्याने प्रचंड वाहतूक कोंडी'
    ],
    safeAlternativeRoadId: 'prabhat-sb-road',
    safeAlternativeName: 'Prabhat Road & Senapati Bapat Road Flyover',
    safeAlternativeNameMarathi: 'प्रभात रस्ता आणि सेनापती बापट मार्ग उड्डाणपूल',
    activeComplaintsCount: 42,
    dewateringPumpDeployed: true,
  },
  {
    id: 'swargate-jedhe-underpass',
    name: 'Swargate Jedhe Chowk Underpass & Drainage Chokepoint',
    nameMarathi: 'स्वारगेट जेधे चौक भुयारी मार्ग व निचरा नाका',
    ward: 'Swargate-Parvati Ward 18',
    wardMarathi: 'स्वारगेट-पार्वती प्रभाग १८',
    coordinates: [
      [18.4985, 73.8562],
      [18.5022, 73.8585],
      [18.5065, 73.8610],
    ],
    elevationMeters: 544,
    slopePercent: 2.1,
    drainCapacityM3s: 12.0,
    catchmentAreaKm2: 26.5,
    proximityToWaterbodyM: 95,
    waterbodyName: 'Ambil Odha Sub-Canal Basin',
    historicalJuly2026PeakDepthCm: 58,
    baseElevationCategory: 'depression',
    drainageCulvertStatus: 'severely_clogged',
    currentWaterDepthCm: 52,
    riskLevel: 'impassable',
    vehicleAccessibility: {
      twoWheeler: false,
      hatchback: false,
      suv: false,
      pedestrian: false,
    },
    hazards: [
      'Underpass submerged >50cm - ROAD CLOSED',
      'Electric substation nearby isolated',
      'Zero visibility of water depth'
    ],
    hazardsMarathi: [
      'भुयारी मार्ग ५० सेमीहून अधिक पाण्याखाली - रस्ता पूर्ण बंद',
      'विद्युत खांबांजवळ करंटचा धोका',
      'खोल पाण्याचा अंदाज न येणे'
    ],
    safeAlternativeRoadId: 'tilak-road-ridge',
    safeAlternativeName: 'Tilak Road - SP College Surface Bypass',
    safeAlternativeNameMarathi: 'टिळक रस्ता - स.प. महाविद्यालय पृष्ठभाग मार्ग',
    activeComplaintsCount: 51,
    dewateringPumpDeployed: true,
  },
  {
    id: 'ambil-odha-dandekar',
    name: 'Ambil Odha / Dandekar Bridge Road',
    nameMarathi: 'आंबिल ओढा / दांडेकर पूल रस्ता',
    ward: 'Parvati-Kasba Ward 17',
    wardMarathi: 'पार्वती-कसबा प्रभाग १७',
    coordinates: [
      [18.4890, 73.8475],
      [18.4942, 73.8498],
      [18.4998, 73.8525],
    ],
    elevationMeters: 543,
    slopePercent: 0.8,
    drainCapacityM3s: 22.0,
    catchmentAreaKm2: 32.0,
    proximityToWaterbodyM: 15,
    waterbodyName: 'Ambil Odha Main Nullah Channel',
    historicalJuly2026PeakDepthCm: 64,
    baseElevationCategory: 'depression',
    drainageCulvertStatus: 'overflowing',
    currentWaterDepthCm: 48,
    riskLevel: 'impassable',
    vehicleAccessibility: {
      twoWheeler: false,
      hatchback: false,
      suv: false,
      pedestrian: false,
    },
    hazards: [
      'Ambil Odha overflowing onto bridge carriageway',
      'Severe undercurrent & heavy silt deposits',
      'Civic barricades active'
    ],
    hazardsMarathi: [
      'आंबिल ओढ्याचे पाणी रस्त्यावरून वाहत आहे',
      'प्रचंड वेगवान प्रवाह आणि चिखल',
      'पालिकेने मार्ग रोखला आहे'
    ],
    safeAlternativeRoadId: 'satara-rd-elevated',
    safeAlternativeName: 'Pune-Satara Road (Bibvewadi Flyover)',
    safeAlternativeNameMarathi: 'पुणे-सातारा रस्ता (बिबवेवाडी उड्डाणपूल)',
    activeComplaintsCount: 65,
    dewateringPumpDeployed: true,
  },
  {
    id: 'law-college-rd',
    name: 'Law College Road (Prabhat Rd to Senapati Bapat Rd)',
    nameMarathi: 'लॉ कॉलेज रोड (प्रभात रस्ता ते सेनापती बापट रस्ता)',
    ward: 'Shivajinagar-Kothrud Ward 10',
    wardMarathi: 'शिवाजीनगर-कोथरूड प्रभाग १०',
    coordinates: [
      [18.5135, 73.8290],
      [18.5190, 73.8320],
      [18.5255, 73.8340],
    ],
    elevationMeters: 582,
    slopePercent: 3.4,
    drainCapacityM3s: 28.0,
    catchmentAreaKm2: 7.5,
    proximityToWaterbodyM: 1200,
    waterbodyName: 'Vetal Hill Natural Ridge Watershed',
    historicalJuly2026PeakDepthCm: 4,
    baseElevationCategory: 'ridge',
    drainageCulvertStatus: 'optimal',
    currentWaterDepthCm: 3,
    riskLevel: 'safe',
    vehicleAccessibility: {
      twoWheeler: true,
      hatchback: true,
      suv: true,
      pedestrian: true,
    },
    hazards: ['Light road slickness', 'Minor leaf debris along gutters'],
    hazardsMarathi: ['पावसामुळे रस्ता निसरडा', 'झाडांची पाने गटारात'],
    activeComplaintsCount: 1,
    dewateringPumpDeployed: false,
  },
  {
    id: 'prabhat-sb-road',
    name: 'Senapati Bapat Road & ICC Tech Corridor',
    nameMarathi: 'सेनापती बापट रस्ता व आयसीसी टेक कॉरिडॉर',
    ward: 'Shivajinagar Ward 9',
    wardMarathi: 'शिवाजीनगर प्रभाग ९',
    coordinates: [
      [18.5255, 73.8340],
      [18.5320, 73.8325],
      [18.5385, 73.8310],
    ],
    elevationMeters: 576,
    slopePercent: 2.8,
    drainCapacityM3s: 24.5,
    catchmentAreaKm2: 9.1,
    proximityToWaterbodyM: 1450,
    waterbodyName: 'Chaturshringi Natural Drainage Gradient',
    historicalJuly2026PeakDepthCm: 6,
    baseElevationCategory: 'elevated',
    drainageCulvertStatus: 'optimal',
    currentWaterDepthCm: 4,
    riskLevel: 'safe',
    vehicleAccessibility: {
      twoWheeler: true,
      hatchback: true,
      suv: true,
      pedestrian: true,
    },
    hazards: ['Smooth traffic flow', 'Normal wet conditions'],
    hazardsMarathi: ['वाहतूक सुरळीत सुरू', 'सामान्य पावसाळी रस्ता'],
    activeComplaintsCount: 2,
    dewateringPumpDeployed: false,
  },
  {
    id: 'karve-road-paud',
    name: 'Karve Road (Garware College to Paud Phata Flyover)',
    nameMarathi: 'कर्वे रस्ता (गरवारे कॉलेज ते पौड फाटा उड्डाणपूल)',
    ward: 'Kothrud Ward 11',
    wardMarathi: 'कोथरूड प्रभाग ११',
    coordinates: [
      [18.5085, 73.8340],
      [18.5055, 73.8270],
      [18.5030, 73.8200],
    ],
    elevationMeters: 566,
    slopePercent: 1.5,
    drainCapacityM3s: 19.0,
    catchmentAreaKm2: 12.0,
    proximityToWaterbodyM: 650,
    waterbodyName: 'Mutha River Mid-Reach',
    historicalJuly2026PeakDepthCm: 18,
    baseElevationCategory: 'elevated',
    drainageCulvertStatus: 'partially_silted',
    currentWaterDepthCm: 14,
    riskLevel: 'warning',
    vehicleAccessibility: {
      twoWheeler: true,
      hatchback: true,
      suv: true,
      pedestrian: true,
    },
    hazards: [
      'Gutter overflow near Paud phata bus stop',
      'Water ponding along curb lane (10-14cm)'
    ],
    hazardsMarathi: [
      'पौड फाटा बस थांब्याजवळ रस्त्याच्या कडेला पाणी',
      'डाव्या लेनमध्ये पाणी साचले आहे'
    ],
    safeAlternativeRoadId: 'law-college-rd',
    safeAlternativeName: 'Law College Road Bypass',
    safeAlternativeNameMarathi: 'लॉ कॉलेज रस्ता बायपास',
    activeComplaintsCount: 9,
    dewateringPumpDeployed: false,
  },
  {
    id: 'jm-road-shivajinagar',
    name: 'Jangli Maharaj (JM) Road (Balgandharva to Sancheti)',
    nameMarathi: 'जंगली महाराज (जे.एम.) रस्ता (बालगंधर्व ते संचेती)',
    ward: 'Shivajinagar Ward 8',
    wardMarathi: 'शिवाजीनगर प्रभाग ८',
    coordinates: [
      [18.5200, 73.8495],
      [18.5255, 73.8505],
      [18.5305, 73.8515],
    ],
    elevationMeters: 554,
    slopePercent: 0.9,
    drainCapacityM3s: 20.5,
    catchmentAreaKm2: 14.8,
    proximityToWaterbodyM: 180,
    waterbodyName: 'Mutha River Left Bank Basin',
    historicalJuly2026PeakDepthCm: 28,
    baseElevationCategory: 'moderate',
    drainageCulvertStatus: 'partially_silted',
    currentWaterDepthCm: 22,
    riskLevel: 'warning',
    vehicleAccessibility: {
      twoWheeler: true,
      hatchback: true,
      suv: true,
      pedestrian: false,
    },
    hazards: [
      'Waterlogging in low lane opposite Balgandharva',
      'Open stormwater grates during desilting'
    ],
    hazardsMarathi: [
      'बालगंधर्व समोरील सखल भागात पाणी साचले',
      'सफाई सुरू असल्याने गटारांच्या जाळ्या उघड्या'
    ],
    safeAlternativeRoadId: 'fc-road-corridor',
    safeAlternativeName: 'FC Road Higher Contour',
    safeAlternativeNameMarathi: 'एफ.सी. रोड उंच मार्ग',
    activeComplaintsCount: 16,
    dewateringPumpDeployed: true,
  },
  {
    id: 'fc-road-corridor',
    name: 'Fergusson College (FC) Road',
    nameMarathi: 'फर्ग्युसन कॉलेज (एफ.सी.) रस्ता',
    ward: 'Shivajinagar Ward 8',
    wardMarathi: 'शिवाजीनगर प्रभाग ८',
    coordinates: [
      [18.5195, 73.8420],
      [18.5245, 73.8425],
      [18.5290, 73.8430],
    ],
    elevationMeters: 561,
    slopePercent: 1.4,
    drainCapacityM3s: 22.0,
    catchmentAreaKm2: 11.2,
    proximityToWaterbodyM: 420,
    waterbodyName: 'Fergusson Hill Runoff',
    historicalJuly2026PeakDepthCm: 14,
    baseElevationCategory: 'moderate',
    drainageCulvertStatus: 'optimal',
    currentWaterDepthCm: 8,
    riskLevel: 'safe',
    vehicleAccessibility: {
      twoWheeler: true,
      hatchback: true,
      suv: true,
      pedestrian: true,
    },
    hazards: ['Slow vehicle movement due to rain', 'Wet pedestrian footpaths'],
    hazardsMarathi: ['पावसामुळे वाहनांची गती संथ', 'पादचारी मार्ग ओला'],
    activeComplaintsCount: 4,
    dewateringPumpDeployed: false,
  },
  {
    id: 'pune-station-subway',
    name: 'Pune Railway Station Bridge & Maldhakka Underpass',
    nameMarathi: 'पुणे रेल्वे स्टेशन पूल व मालधक्का भुयारी मार्ग',
    ward: 'Pune Station-Camp Ward 14',
    wardMarathi: 'पुणे स्टेशन-कॅम्प प्रभाग १४',
    coordinates: [
      [18.5260, 73.8710],
      [18.5290, 73.8745],
      [18.5320, 73.8780],
    ],
    elevationMeters: 550,
    slopePercent: 2.2,
    drainCapacityM3s: 13.0,
    catchmentAreaKm2: 24.0,
    proximityToWaterbodyM: 700,
    waterbodyName: 'Nagzari Nullah Downstream Catchment',
    historicalJuly2026PeakDepthCm: 48,
    baseElevationCategory: 'depression',
    drainageCulvertStatus: 'severely_clogged',
    currentWaterDepthCm: 41,
    riskLevel: 'severe',
    vehicleAccessibility: {
      twoWheeler: false,
      hatchback: false,
      suv: true,
      pedestrian: false,
    },
    hazards: [
      'Subway dipped section deep water (41cm)',
      'Autorickshaws stalled under railway girder',
      'Heavy pedestrian crowding'
    ],
    hazardsMarathi: [
      'रेल्वे भुयारी मार्गात ४१ सेमी खोल पाणी',
      'रिक्षा बंद पडल्याने मार्ग अडवला',
      'नागरिकांची गैरसोय'
    ],
    safeAlternativeRoadId: 'sangamwadi-flyover',
    safeAlternativeName: 'Sangamwadi Elevated Corridor',
    safeAlternativeNameMarathi: 'संगमवाडी उड्डाणपूल मार्ग',
    activeComplaintsCount: 29,
    dewateringPumpDeployed: true,
  },
  {
    id: 'bund-garden-yerawada',
    name: 'Bund Garden - Yerawada Bridge Approach',
    nameMarathi: 'बंड गार्डन - येरवडा पूल मार्ग',
    ward: 'Yerawada Ward 6',
    wardMarathi: 'येरवडा प्रभाग ६',
    coordinates: [
      [18.5350, 73.8810],
      [18.5400, 73.8860],
      [18.5440, 73.8910],
    ],
    elevationMeters: 546,
    slopePercent: 0.5,
    drainCapacityM3s: 26.0,
    catchmentAreaKm2: 38.0,
    proximityToWaterbodyM: 25,
    waterbodyName: 'Mula-Mutha River Confluence',
    historicalJuly2026PeakDepthCm: 45,
    baseElevationCategory: 'valley',
    drainageCulvertStatus: 'partially_silted',
    currentWaterDepthCm: 32,
    riskLevel: 'severe',
    vehicleAccessibility: {
      twoWheeler: false,
      hatchback: false,
      suv: true,
      pedestrian: false,
    },
    hazards: [
      'River flood line breached along promenade',
      'Strong gusty winds & tree branches'
    ],
    hazardsMarathi: [
      'नदीकाठची पूररेषा ओलांडली',
      'वादळी वारा आणि झाडांच्या फांद्या'
    ],
    safeAlternativeRoadId: 'kalyani-nagar-bridge',
    safeAlternativeName: 'Kalyani Nagar Bridge High Span',
    safeAlternativeNameMarathi: 'कल्याणी नगर उंच पूल',
    activeComplaintsCount: 19,
    dewateringPumpDeployed: true,
  },
  {
    id: 'hinjawadi-phase1-chokepoint',
    name: 'Hinjawadi Phase 1 (Wipro Circle to Shivaji Chowk)',
    nameMarathi: 'हिंजवडी फेज १ (विप्रो सर्कल ते शिवाजी चौक)',
    ward: 'PCMC / Hinjawadi IT Zone',
    wardMarathi: 'हिंजवडी आयटी झोन',
    coordinates: [
      [18.5880, 73.7340],
      [18.5915, 73.7380],
      [18.5950, 73.7430],
    ],
    elevationMeters: 584,
    slopePercent: 1.1,
    drainCapacityM3s: 16.0,
    catchmentAreaKm2: 15.0,
    proximityToWaterbodyM: 320,
    waterbodyName: 'Local Storm Runoff Basin',
    historicalJuly2026PeakDepthCm: 34,
    baseElevationCategory: 'moderate',
    drainageCulvertStatus: 'partially_silted',
    currentWaterDepthCm: 26,
    riskLevel: 'severe',
    vehicleAccessibility: {
      twoWheeler: false,
      hatchback: false,
      suv: true,
      pedestrian: false,
    },
    hazards: [
      'Construction debris blocking side culvert',
      'Heavy IT commuter traffic jams'
    ],
    hazardsMarathi: [
      'बांधकाम साहित्यामुळे नाला तुंबला',
      'आयटी कर्मचाऱ्यांची वाहतूक कोंडी'
    ],
    safeAlternativeRoadId: 'marunji-bypass',
    safeAlternativeName: 'Marunji Elevated Bypass',
    safeAlternativeNameMarathi: 'मारुंजी बायपास रस्ता',
    activeComplaintsCount: 22,
    dewateringPumpDeployed: false,
  }
];

export const PUNE_WATERWAYS: WaterwayChannel[] = [
  {
    id: 'mutha-river',
    name: 'Mutha River Channel (Khadakwasla Dam to Sangam)',
    nameMarathi: 'मुठा नदी पात्र (खडकवासला ते संगम)',
    type: 'river',
    currentDischargeLevel: 'danger',
    dischargeCusecs: 28400,
    coordinates: [
      [18.4720, 73.8150],
      [18.4850, 73.8240],
      [18.5000, 73.8370],
      [18.5130, 73.8440],
      [18.5280, 73.8560],
      [18.5370, 73.8760],
    ],
  },
  {
    id: 'ambil-odha',
    name: 'Ambil Odha Natural Storm Canal (Katraj Lake to Mutha)',
    nameMarathi: 'आंबिल ओढा नैसर्गिक नाला (कात्रज तलाव ते मुठा नदी)',
    type: 'nullah',
    currentDischargeLevel: 'extreme',
    dischargeCusecs: 9200,
    coordinates: [
      [18.4550, 73.8550],
      [18.4750, 73.8510],
      [18.4900, 73.8490],
      [18.5050, 73.8480],
      [18.5120, 73.8445],
    ],
  },
  {
    id: 'nagzari-nullah',
    name: 'Nagzari Nullah (Bibvewadi through Old City)',
    nameMarathi: 'नागझरी नाला (बिबवेवाडी ते कसबा पेठ)',
    type: 'nullah',
    currentDischargeLevel: 'alert',
    dischargeCusecs: 3800,
    coordinates: [
      [18.4850, 73.8650],
      [18.5050, 73.8640],
      [18.5200, 73.8620],
      [18.5310, 73.8680],
    ],
  }
];

export const SAFE_ROUTES_CATALOG = [
  {
    originId: 'sinhagad-pula-rajaram',
    originName: 'Sinhagad Road (Pu La Deshpande)',
    originNameMarathi: 'सिंहगड रस्ता (पु.ल. देशपांडे)',
    destinationId: 'pune-station-subway',
    destinationName: 'Pune Railway Station',
    destinationNameMarathi: 'पुणे रेल्वे स्टेशन',
    
    // Dangerous Direct Route (Google Maps style shortest path)
    directRoute: {
      type: 'flooded_direct' as const,
      title: 'Standard Direct Route (Via Sinhagad Rd & Alka Talkies)',
      titleMarathi: 'थेट नेहमीचा मार्ग (सिंहगड रस्ता व अलका टॉकीज मार्गे)',
      distanceKm: 8.4,
      estimatedMinutes: 55, // delayed by floods
      maxWaterDepthCm: 44,
      riskLevel: 'severe' as const,
      passableForSelectedVehicle: false,
      averageElevationM: 547,
      coordinates: [
        [18.4862, 73.8265],
        [18.4988, 73.8378],
        [18.5115, 73.8425],
        [18.5142, 73.8455],
        [18.5200, 73.8495],
        [18.5260, 73.8710],
        [18.5290, 73.8745],
      ] as [number, number][],
      segments: [
        {
          name: 'Sinhagad Road Near Manik Baug',
          nameMarathi: 'सिंहगड रस्ता माणिकबाग जवळ',
          depthCm: 44,
          elevationM: 546,
          risk: 'severe' as const,
          warning: '44cm water depth! Two-wheelers will stall. Submerged median divider.',
          warningMarathi: '४४ सेमी पाणी! दुचाकीचे इंजिन बंद पडेल. दुभाजक पाण्याखाली.'
        },
        {
          name: 'Alka Talkies & Sambhaji Bridge Approach',
          nameMarathi: 'अलका टॉकीज व संभाजी पूल',
          depthCm: 38,
          elevationM: 548,
          risk: 'severe' as const,
          warning: '38cm water depth. Heavy river backflow. Manhole open.',
          warningMarathi: '३८ सेमी पाणी. नदीपात्रातून उलट प्रवाह. उघडे मॅनहोल.'
        },
        {
          name: 'Pune Station Underpass',
          nameMarathi: 'पुणे स्टेशन भुयारी मार्ग',
          depthCm: 41,
          elevationM: 550,
          risk: 'severe' as const,
          warning: '41cm under girder. Traffic halted.',
          warningMarathi: '४१ सेमी पाणी. वाहतूक ठप्प.'
        }
      ],
      turnGuidance: [
        {
          instruction: 'Proceed northeast on Sinhagad Road towards Rajaram Bridge',
          instructionMarathi: 'सिंहगड रस्त्यावरून राजाराम पुलाकडे निघा',
          distanceM: 1800,
          safetyNote: 'DANGER: Waterlogging depth 44cm at Pu La Deshpande stretch!'
        },
        {
          instruction: 'Continue straight through Alka Talkies Chowk',
          instructionMarathi: 'अलका टॉकीज चौकातून सरळ जा',
          distanceM: 1200,
          safetyNote: 'CRITICAL: Severe flooding at bridge approach.'
        },
        {
          instruction: 'Enter Pune Railway Station subway',
          instructionMarathi: 'पुणे स्टेशन भुयारी मार्गात प्रवेश करा',
          distanceM: 800,
          safetyNote: 'DO NOT ENTER: Underpass flooded above wheel rims.'
        }
      ]
    },

    // AI Recommended Flood-Safe Alternate
    safeRoute: {
      type: 'ai_flood_safe' as const,
      title: 'FloodShield AI Recommended Alternate (Via Law College Ridge & S.B. Road)',
      titleMarathi: 'फ्लडशील्ड सुरक्षित पर्यायी मार्ग (लॉ कॉलेज व सेनापती बापट मार्ग)',
      distanceKm: 10.2,
      estimatedMinutes: 24, // clear flowing traffic on high contour
      maxWaterDepthCm: 4,
      riskLevel: 'safe' as const,
      passableForSelectedVehicle: true,
      averageElevationM: 578,
      coordinates: [
        [18.4862, 73.8265],
        [18.5030, 73.8200], // detour uphill to Karve road Paud Phata
        [18.5135, 73.8290], // Law College road
        [18.5255, 73.8340], // S.B. road
        [18.5350, 73.8580], // University Road flyover
        [18.5320, 73.8780], // Elevated approach to station
      ] as [number, number][],
      segments: [
        {
          name: 'Paud Phata Elevated Ramp',
          nameMarathi: 'पौड फाटा उंच रॅम्प',
          depthCm: 4,
          elevationM: 568,
          risk: 'safe' as const,
          warning: 'Clear asphalt, high elevation gradient.',
          warningMarathi: 'रस्ता स्वच्छ, पाण्याचा उत्तम निचरा.'
        },
        {
          name: 'Law College Road Ridge',
          nameMarathi: 'लॉ कॉलेज रस्ता उंच माथा',
          depthCm: 3,
          elevationM: 582,
          risk: 'safe' as const,
          warning: 'Elevated 36m above river flood plain. Zero waterlogging.',
          warningMarathi: 'नदीच्या पूररेषेपेक्षा ३६ मीटर उंच. अजिबात पाणी नाही.'
        },
        {
          name: 'Senapati Bapat Road Flyover',
          nameMarathi: 'सेनापती बापट रस्ता उड्डाणपूल',
          depthCm: 3,
          elevationM: 576,
          risk: 'safe' as const,
          warning: 'Safe for all 2-wheelers, cars, and pedestrians.',
          warningMarathi: 'सर्व दुचाकी, मोटारी आणि पादचाऱ्यांसाठी १००% सुरक्षित.'
        }
      ],
      turnGuidance: [
        {
          instruction: 'Turn Left early at Anand Nagar toward Paud Phata elevated bypass',
          instructionMarathi: 'आनंद नगर चौकातून डावीकडे वळून पौड फाटा उंच मार्गावर जा',
          distanceM: 1400,
          safetyNote: 'Bypasses Sinhagad riverbank depression completely (+32m elevation gain).'
        },
        {
          instruction: 'Continue north along Law College Road ridge corridor',
          instructionMarathi: 'लॉ कॉलेज रस्त्यावरून पुढे जात राहा',
          distanceM: 2600,
          safetyNote: 'Pavement completely drained. Natural gradient flow.'
        },
        {
          instruction: 'Take Senapati Bapat Road to Sancheti Elevated Flyover',
          instructionMarathi: 'सेनापती बापट रस्त्यावरून संचेती उड्डाणपुलाचा वापर करा',
          distanceM: 3200,
          safetyNote: 'Avoids ground level railway subway inundation.'
        }
      ]
    }
  }
];
