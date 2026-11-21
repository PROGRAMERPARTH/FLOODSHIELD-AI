<div align="center">
  <h1>🌊 FloodShield AI - Hyperlocal Flood Intelligence</h1>
  <p><strong>Predictive urban inundation modeling, multimodal vision flood depth estimation, safe routing, and localized disaster alerts for smart cities.</strong></p>

  <p>
    <a href="https://render.com/deploy?repo=https://github.com/PROGRAMERPARTH/FLOODSHIELD-AI">
      <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" />
    </a>
  </p>
</div>

---

## 🌟 Overview

**FloodShield AI** is a real-time hyperlocal flood intelligence system developed for urban flood resilience (with Pune Municipal Corporation / PMC as the benchmark urban testbed). It synthesizes upstream dam discharge telemetry, live rainfall intensity, terrain slope, elevation profiles, and drainage culvert status to forecast waterlogging down to specific street corridors.

When flash floods threaten road networks, FloodShield AI:
1. **Analyzes Citizen Flood Photos** using Gemini Multimodal Vision AI to estimate water depth (in cm), identify anchor benchmarks (wheel rims, curbs, exhaust pipes), assess vehicle accessibility, and detect concealed hazards.
2. **Computes Dynamic Flood-Safe Routing** that steers 2-wheelers, hatchbacks, SUVs, and pedestrians away from low-elevation depressions and submerged underpasses onto elevated ridge corridors.
3. **Generates Localized Marathi Emergency Broadcasts** in authentic Devanagari with TTS audio announcement scripts and WhatsApp/SMS emergency alerts.
4. **Coordinates Civic Mitigation Workflows** for municipal disaster cells, dispatching 50 HP dewatering suction pumps to drainage chokepoints and tracking complaints against historical monsoon inundation records.

---

## 🚀 Key Features

- **🗺️ Interactive Risk Map (Leaflet):** High-contrast dark basemap showing road segment waterlogging severity, waterbody channels (Mutha River, nullahs, canals), and real-time citizen incident markers.
- **👁️ Multimodal AI Vision Depth Analysis:** Upload or snap road inundation photos. Powered by Google Gemini 2.5 Flash, the vision pipeline calculates depth in centimeters and validates citizen submissions.
- **🧭 Dynamic Flood-Safe Route Planner:** Evaluates multiple road paths, elevation gradients, and vehicle-specific clearance thresholds (`2-Wheeler: 15cm`, `Hatchback: 25cm`, `SUV: 48cm`, `Pedestrian: 20cm`).
- **📢 Localized Marathi Alert Center:** Dual-language emergency advisories (मराठी & English) with integrated speech synthesis for citizen awareness broadcasts.
- **🛠️ Civic Action & Dewatering Cell:** Situational reporting (SitRep) dashboard with downloadable JSON export for PMC disaster operations.
- **⚡ Monsoon Telemetry Simulation:** Sliders and presets (e.g. July 2026 Inundation, Peak Surge, Moderate Rain) to simulate future rainfall bands (+1h, +3h, +6h) and Khadakwasla dam discharge.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Leaflet
- **Backend:** Express.js, TypeScript, TSX
- **AI Engine:** Google Gemini AI (`@google/genai` SDK with resilient multi-model fallback across `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`)
- **Bundler:** Vite 8

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ or v20+ recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PROGRAMERPARTH/floodshield-ai---hyperlocal-flood-intelligence.git
   cd floodshield-ai---hyperlocal-flood-intelligence
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   APP_URL="http://localhost:3000"
   # Optional: customize preferred Gemini model
   # GEMINI_MODEL="gemini-2.5-flash"
   ```

4. **Run the Application:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security

- `.env` and `.env.local` are strictly excluded in `.gitignore` to prevent secret leakage.
- Sensitive API keys are never exposed on client-side bundles; all Gemini AI calls run server-side via Express endpoints with payload validation and rate-limit error mapping.

---

## 📄 License

MIT License. Designed and engineered for urban disaster resilience.
