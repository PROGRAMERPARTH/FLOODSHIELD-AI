import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Body parsers - allow larger payloads for base64 flood image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Shared Gemini Client
let geminiAi: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Simple in-memory TTL cache + in-flight deduplication to prevent redundant Gemini calls & 429 rate limits
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T): void {
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function runDeduplicated<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;

  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn()
    .then((result) => {
      setCached(key, result);
      return result;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, promise);
  return promise;
}

function parseGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : String(err ?? 'Unknown Gemini API error');

  if (
    rawMessage.includes('429') ||
    rawMessage.includes('RESOURCE_EXHAUSTED') ||
    rawMessage.toLowerCase().includes('quota')
  ) {
    const retryMatch = rawMessage.match(/retry in ([\d.]+)s/i);
    const retryWait = retryMatch ? `${Math.ceil(parseFloat(retryMatch[1]))}s` : 'about a minute';
    return {
      status: 429,
      message: `Gemini API free-tier rate limit reached (5 requests/min). Please retry in ${retryWait}, or configure a billing-enabled API key in Settings > Secrets.`,
    };
  }

  if (rawMessage.includes('403') || rawMessage.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message: 'Gemini API permission denied. Please verify your API key in Settings > Secrets.',
    };
  }

  if (rawMessage.includes('400') || rawMessage.includes('API_KEY_INVALID')) {
    return {
      status: 400,
      message: 'Invalid Gemini API key or request payload. Please check your key in Settings > Secrets.',
    };
  }

  if (rawMessage.includes('404') || rawMessage.includes('NOT_FOUND')) {
    return {
      status: 404,
      message: 'Requested Gemini model was not found or is unsupported.',
    };
  }

  return {
    status: 502,
    message: 'Unable to reach Gemini AI service right now. Please try again shortly.',
  };
}

/**
 * Endpoint: POST /api/gemini/analyze-flood-photo
 * Analyzes citizen-uploaded image to estimate water depth, physical reference benchmarks,
 * vehicle accessibility, and hazard flags.
 */
app.post('/api/gemini/analyze-flood-photo', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, locationName, roadSegmentId } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!geminiAi || !process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please add your API key in Settings > Secrets.',
      });
    }

    // Extract MIME type & base64 payload safely
    const dataUrlMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    const resolvedMimeType = dataUrlMatch ? dataUrlMatch[1] : (mimeType || 'image/jpeg');
    const cleanBase64 = dataUrlMatch ? dataUrlMatch[2] : imageBase64.replace(/^data:[^;]+;base64,/, '');

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(resolvedMimeType)) {
      return res.status(400).json({
        error: `Unsupported image format (${resolvedMimeType}). Please upload a PNG, JPG, or WEBP image.`,
      });
    }

    const cacheKey = `photo:${roadSegmentId || 'unknown'}:${cleanBase64.slice(0, 64)}:${cleanBase64.length}`;

    const prompt = `You are an expert hydrological disaster intelligence AI analyzing a flooded urban road during heavy monsoon rainfall in Pune/India (Road: ${locationName || 'Urban Road Segment'}).
Carefully inspect this image for visual water depth indicators:
1. Physical anchors (wheel rim submersion, half-wheel, full wheel, motorcycle exhaust pipe level, pedestrian ankles/knees/waist, submerged sidewalk curbs, shop steps, median dividers).
2. Estimate the water depth in centimeters (cm).
3. Evaluate road accessibility for: 
   - 2-Wheelers (Scooters, Motorcycles): [Safe / Caution / Impassable]
   - Compact Hatchback/Sedans: [Safe / Caution / Impassable]
   - SUVs & High-clearance vehicles: [Safe / Caution / Impassable]
   - Pedestrians: [Safe / Caution / Impassable]
4. Identify active hazards (floating debris, suspected missing manhole covers, electrical wire/pole proximity, fast undercurrent, silt).
5. Produce a crisp safety advisory in English AND a localized Marathi emergency advisory (मराठी इशारा).

Return strictly valid JSON with this exact schema:
{
  "estimatedDepthCm": number,
  "depthCategory": "shallow" | "moderate" | "severe" | "critical",
  "confidenceScore": number,
  "depthVisualIndicators": [string],
  "accessibility": {
    "twoWheeler": "Safe" | "Caution" | "Impassable",
    "hatchback": "Safe" | "Caution" | "Impassable",
    "suv": "Safe" | "Caution" | "Impassable",
    "pedestrian": "Safe" | "Caution" | "Impassable"
  },
  "hazards": [string],
  "urgencyLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "aiObservationSummary": string,
  "aiObservationSummaryMarathi": string
}`;

    const parsed = await runDeduplicated(cacheKey, async () => {
      const response = await geminiAi!.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: resolvedMimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text ?? '{}').trim();
      return JSON.parse(rawText);
    });

    return res.json({ success: true, analysis: parsed, source: 'gemini-4-hydrogen' });
  } catch (error: unknown) {
    const mapped = parseGeminiError(error);
    return res.status(mapped.status).json({ error: mapped.message });
  }
});

/**
 * Endpoint: POST /api/gemini/generate-marathi-alert
 * Generates official localized Marathi emergency broadcast for disaster management
 * and citizen WhatsApp/SMS alert channels.
 */
app.post('/api/gemini/generate-marathi-alert', async (req: Request, res: Response) => {
  try {
    const { roadName, waterDepthCm, riskLevel, alternateRoute, wardName, rainfallMmHr } = req.body;

    if (!geminiAi || !process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please add your API key in Settings > Secrets.',
      });
    }

    const cacheKey = `alert:${roadName}:${waterDepthCm}:${riskLevel}:${wardName}:${rainfallMmHr}`;

    const prompt = `You are the chief communications officer for Pune Municipal Corporation (PMC) Disaster Management Cell.
Create a localized, clear, high-urgency public flood safety alert in authentic Marathi (मराठी) and English for citizen WhatsApp and SMS broadcast.

Context:
- Location: ${roadName || 'Sinhagad Road / Alka Talkies Chowk'}
- Ward: ${wardName || 'Deccan-Kothrud Ward 12'}
- Current Waterlogging Depth: ${waterDepthCm || 35} cm
- Risk Level: ${riskLevel || 'Severe'}
- Rainfall Intensity: ${rainfallMmHr || 42} mm/hr
- Recommended Safe Alternate Route: ${alternateRoute || 'Law College Road / Senapati Bapat Road Flyover'}

Return strictly valid JSON:
{
  "alertTitleMarathi": "string",
  "alertTitleEnglish": "string",
  "marathiMessage": "string",
  "englishMessage": "string",
  "safeRouteMarathi": "string",
  "safeRouteEnglish": "string",
  "emergencyHelplines": [
    { "nameMarathi": "string", "name": "string", "number": "string" }
  ],
  "audioAnnouncementScriptMarathi": "string"
}`;

    const parsed = await runDeduplicated(cacheKey, async () => {
      const response = await geminiAi!.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text ?? '{}').trim();
      return JSON.parse(rawText);
    });

    return res.json({ success: true, alert: parsed, source: 'gemini-4-hydrogen' });
  } catch (error: unknown) {
    const mapped = parseGeminiError(error);
    return res.status(mapped.status).json({ error: mapped.message });
  }
});

/**
 * Endpoint: POST /api/gemini/predict-corridor-risk
 * Runs predictive analysis for road corridors considering rainfall band forecast
 * and historical July 2026 civic flood benchmarks.
 */
app.post('/api/gemini/predict-corridor-risk', async (req: Request, res: Response) => {
  try {
    const { segmentName, currentRainMm, forecastRainMm, elevationMeters, proximityToRiverMeters } = req.body;

    if (!geminiAi || !process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please add your API key in Settings > Secrets.',
      });
    }

    const cacheKey = `predict:${segmentName}:${currentRainMm}:${forecastRainMm}:${elevationMeters}:${proximityToRiverMeters}`;

    const prompt = `As a predictive flood hydrologist, predict the 1-hour and 3-hour waterlogging risk for this road segment:
- Road: ${segmentName}
- Current Rain: ${currentRainMm} mm/hr
- Forecast Rain (+3hr): ${forecastRainMm} mm/hr
- Elevation: ${elevationMeters}m MSL
- Proximity to River/Nullah: ${proximityToRiverMeters}m
- Historical Benchmark: July 2026 Pune flash inundation

Provide:
1. Expected peak water depth (cm)
2. Risk progression curve (0h, +1h, +3h, +6h)
3. Drainage bottleneck probability (%)
4. Recommended civic action (e.g. dewatering pumps, traffic diversion)
5. Citizen safety advisory.

Return strictly valid JSON:
{
  "peakDepthCm": number,
  "riskLevel": "Low" | "Moderate" | "High" | "Severe",
  "waterLevelCurve": [
    { "timeOffset": "0h (Now)", "depthCm": number },
    { "timeOffset": "+1h", "depthCm": number },
    { "timeOffset": "+3h (Peak)", "depthCm": number },
    { "timeOffset": "+6h", "depthCm": number }
  ],
  "drainageBottleneckPercent": number,
  "civicActionRequired": string,
  "citizenAdvisory": string
}`;

    const parsed = await runDeduplicated(cacheKey, async () => {
      const response = await geminiAi!.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text ?? '{}').trim();
      return JSON.parse(rawText);
    });

    return res.json({ success: true, prediction: parsed, source: 'gemini-4-hydrogen' });
  } catch (error: unknown) {
    const mapped = parseGeminiError(error);
    return res.status(mapped.status).json({ error: mapped.message });
  }
});

// Vite Middleware mounting for Dev or Static file serving for Production
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FloodShield AI server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
