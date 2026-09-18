# CARBON//PULSE

A high-precision personal carbon footprint command center that transforms everyday activities into transparent, actionable weekly climate intelligence.

## Track
Climate Tech

## Live Demo
https://pahulveer.github.io/Carbon_Pulse/
## Hackathon ID

AZIS-8MNUDY

## Tech Stack
- **Frontend Framework**: React 19 + TypeScript (Strict Type Safety)
- **Build Engine**: Vite 8.3 (Sub-second HMR & optimized production bundling)
- **Styling Architecture**: Custom Modern Vanilla CSS Design Tokens (Carbon Obsidian / Emerald Telemetry / Glassmorphism HUD)
- **Iconography**: Lucide React (High-contrast accessible SVG icons — zero emojis as UI icons)
- **Data Visualizations**: Custom Lightweight SVG Visualizations (7-Day Monday–Sunday Weekly Emissions Bar Chart + Interactive Category Donut Ring)
- **Animations & Feedback**: Canvas-Confetti & CSS Keyframe Transitions (with full `prefers-reduced-motion` compliance)
- **Persistence Layer**: Versioned `localStorage` with JSON Schema validation and fallback self-healing

## Features

### 1. Activity Logging Engine
- Records activities across all standard categories:
  - **Car travel**: `0.20 kg CO₂ / km`
  - **Bus travel**: `0.08 kg CO₂ / km`
  - **Flight**: `0.25 kg CO₂ / km`
  - **Electricity**: `0.80 kg CO₂ / kWh`
  - **Veg meal**: `0.50 kg CO₂ / meal`
  - **Non-veg meal**: `2.00 kg CO₂ / meal`
- **Dynamic Unit Switching**: Automatically adapts between `km`, `kWh`, and `meals`.
- **Transparent Mathematical Preview**: Displays the exact live calculation before saving:
  `10 km × 0.20 kg/km = 2.00 kg CO₂`.
- **Keyboard Shortcuts**: Press `L` or `+` to open the log modal instantly; `Esc` to dismiss.

### 2. Command Center Dashboard
- **Real-Time Weekly Footprint**: Prominent live ticker with kg CO₂ totals.
- **Dynamic Target Progress Gauge**: Real-time percentage of weekly allowance utilized.
- **Remaining Budget Telemetry**: Displays remaining kg allowance or exceeded delta.
- **7-Day Monday–Sunday Bar Chart**: Daily emission levels with reference average target line and today highlight.
- **Category Donut Ring & Stats**: Visual distribution across Transport, Food, and Energy.
- **Recent Activities Stream**: Instant live feed with inline deletion.

### 3. Weekly Carbon Target
- Interactive budget setter with presets (`15 kg`, `20 kg`, `25 kg`, `35 kg`) and custom inputs.
- Instant synchronization across all dashboard gauges, pacing meters, and historical filters.

### 4. Activity Ledger & Multi-Axis Filtering
- **Multi-Axis Filtering**: Filter by category (Transport, Energy, Food) and activity type (Car, Bus, Flight, Electricity, Veg, Non-veg).
- **Dashboard Drilldown**: Clicking any slice or legend item in the Category Donut immediately routes to the ledger filtered to that category.
- **Temporal Scoping**: Filter by date range (All time, This week: Mon → Sun, Custom date range).
- **Instant Search & Sort**: Real-time keyword search across labels, dates, and notes; sort by date or carbon output.
- **Active Filter Chips**: Visual tag indicators for applied filters with one-click removal and reset.
- **Data Portability**: Full RFC 4180-compliant CSV export (with note escaping) and JSON backup export/import with validation.

### 5. Evaluation Scenarios Panel
A subtle, collapsible drawer in the bottom right corner for judges:
- **Standard Week (On Pace)**: Loads standard balanced week (13.8 kg / 20.0 kg target, 69% used).
- **DP1 Demo (Target Exceeded)**: Loads high-emission week (25.5 kg / 20.0 kg target, +5.5 kg above target), triggering The Nudge with authentic encouragement.
- **DP2 Demo (500,000 km)**: Pre-fills `500,000 km` to demonstrate anomaly interception.
- **Target Budget**: Quick target adjustment modal.
- **Reset**: Clears state to test first-run onboarding.

## Decision Points

### DP1 — The Nudge (Target Exceeded)
- **Philosophy**: *Encourage + inform, never shame and never block.*
- **Behavior**: When weekly emissions cross the user's target (e.g., `23.4 kg / 20.0 kg`), the system presents a supportive, high-contrast banner:
  > *"You're 3.4 kg above your weekly target. Your tracking still matters. Continue logging your activities to understand where your footprint is coming from."*
- **No Blocking**: Zero lockouts or disabled forms; full access to history and logging is retained.

### DP2 — Absurd Input (Rule-Based Anomaly Detection)
- **Philosophy**: *Flag, don't assume.*
- **Behavior**: Single entries exceeding realistic operational thresholds (e.g., `500,000 km`, `> 3,000 kWh`, `> 20 meals`, or `> 500 kg CO₂`) are intercepted before committing:
  > *"500,000 km would produce: 100,000.00 kg CO₂. This value is unusually large for a single car travel activity. Please verify the distance."*
- **User Control**: Provides two clear options: `[EDIT ENTRY]` to correct typos, or `[CONFIRM ANYWAY]` to preserve user agency.

### DP3 — The Deterministic Week
- **Philosophy**: *Strict ISO calendar synchronization and objective pace telemetry.*
- **Behavior**:
  - Dynamic Monday 00:00:00 → Sunday 23:59:59 boundary calculation with localized date range (e.g., Monday September 14, 2026 → Sunday September 20, 2026, displayed as `14 SEP → 20 SEP`).
  - Measures `% of target used` alongside `% of week elapsed`.
  - Computes non-judgmental status badges: `ON PACE`, `ABOVE CURRENT PACE`, or `BELOW CURRENT PACE`.

*For comprehensive rationale and architectural background, refer to [DECISIONS.md](file:///c:/Hack-A-thon/Carbon_Pulse/DECISIONS.md).*

## Standard API
Requires manual verification — No official standard API specification for the Climate Tech track was provided in the local repository configuration or project materials. The application currently operates as a fully client-side command center with deterministic local calculation engines and JSON export/import data portability.

## Run Locally

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Launch
```bash
# Navigate to the project directory
cd Carbon_Pulse

# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Run production build and type validation
npm run build
```

The application will be accessible at `http://localhost:5173`.

## Test Credentials
Not applicable — authentication is intentionally not used per hackathon guidelines. All command center features are accessible immediately upon launch.
