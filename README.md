# 🕷️ WebRescue — Autonomous Self-Healing Web Scraping Infrastructure

> **WebRescue** is an autonomous reliability layer for web-data pipelines built for the **Into the Scrape-Verse Hackathon**. Give it a natural language goal ➔ It discovers public data sources ➔ Generates real Bright Data Scraper Studio Collectors (`c_*`) ➔ Validates data quality in real-time ➔ Detects DOM drift / selector breakages ➔ Triggers `bdata scraper heal` ➔ Keeps your downstream database & AI pipeline flowing seamlessly under the exact same Collector ID.

---

## 📽️ Demo Video & Project Pitch

- 🎬 **Demo Video Link**: [Watch 4-Minute WebRescue Video Demo on YouTube / Loom](https://youtube.com/watch?v=YOUR_DEMO_VIDEO_LINK_HERE) *(Replace with your video link)*
- 🔗 **GitHub Repository**: [https://github.com/RautDayanand/WebRescue](https://github.com/RautDayanand/WebRescue)
- 🏆 **Hackathon Track**: Web-Slinger — Best Use of Bright Data (Scraper Studio & In-Place Self-Healing)

---

## 💡 The Problem & Solution

### ❌ The Problem: Silent Web Scraper Failure
Traditional web scrapers break whenever target websites update their design, change CSS selectors, or alter DOM trees. Worse yet, scrapers often **fail silently**—returning HTTP status `200 OK` while extracting `null` fields, silently corrupting downstream databases, analytics, and AI applications.

### ✅ The Solution: WebRescue Self-Healing Engine
WebRescue treats scrapers as autonomous, self-healing software components driven by **Bright Data Scraper Studio**:
1. **Four-Tier Data Quality Validation**: Monitors field completeness ratios, type purity, range bounds, and anomaly metrics to compute a **0–100 Scraper Health Score**.
2. **Instant Extraction Drift Detection**: Flags breakage when field completeness drops below acceptable thresholds (e.g. price completeness dropping from 96% to 12%).
3. **In-Place AI Repair (`bdata scraper heal`)**: Automatically formulates failure repair prompts and invokes Bright Data's self-healing engine.
4. **Zero-Downtime Pipeline Continuity**: Preserves the exact same `c_*` Collector ID so downstream database operations and Next.js UI dashboards never break.

---

## ⚡ How Bright Data Scraper Studio Powers WebRescue

Bright Data Scraper Studio is the core scraping & unblocking engine of WebRescue:

1. **CLI Authentication & Infrastructure Connection**:
   Authenticated via `npx -p @brightdata/cli bdata login`, utilizing active `cli_unlocker` (Web Unlocker API) and `cli_browser` (Browser API) cloud zones.
2. **Autonomous Collector Creation (`c_*`)**:
   Generates authentic cloud Scraper Studio Collectors using natural language intents:
   ```bash
   npx -p @brightdata/cli bdata scraper create https://news.ycombinator.com "Extract top stories: title, url, points, author, comment count" --json
   ```
   *Active Production Collector ID*: **`c_mt5uny9822ng9wnh`**
3. **Live Execution (`bdata scraper run`)**:
   Extracts clean, structured JSON payloads directly from live public targets.
4. **In-Place Self-Healing (`bdata scraper heal`)**:
   When validation drops, WebRescue triggers `bdata scraper heal c_mt5uny9822ng9wnh "<REPAIR_PROMPT>"` to update extraction rules on Bright Data's cloud infrastructure without altering application source code.

---

## 📊 Proof of Concept: Live Extracted JSON Output

The following structured payload was extracted directly from Hacker News using active Bright Data Collector **`c_mt5uny9822ng9wnh`**:

```json
[
  {
    "title": "Zig’s Io.Threaded is neat",
    "url": "https://matklad.github.io/2026/08/06/neat-io-threaded.html",
    "points": 154,
    "author": "chilipepperhott",
    "comment_count": 0,
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "title": "Reading Maps – Journeys from fiction drawn on the real world",
    "url": "https://readingmaps.com/",
    "points": 39,
    "author": "hakkikonu",
    "comment_count": 0,
    "input": {
      "url": "https://news.ycombinator.com"
    }
  },
  {
    "title": "There's no reason for software to be slow anymore",
    "url": "https://danluu.com/perf-opt/",
    "points": 635,
    "author": "Jach",
    "comment_count": 0,
    "input": {
      "url": "https://news.ycombinator.com"
    }
  }
]
```

---

## 🏗️ System Architecture

```text
               ┌───────────────────────┐
               │    WebRescue App      │
               │ (Next.js 14 / React)  │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │    AI Goal Planner    │
               │   & Source Discovery  │
               └───────────┬───────────┘
                           │
                           ▼
             ┌───────────────────────────┐
             │    Bright Data Scraper    │
             │          Studio           │
             └─────────────┬─────────────┘
                           │
                     c_mt5uny9822ng9wnh
                           │
                           ▼
               ┌───────────────────────┐
               │  Live Structured JSON │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  4-Tier Data Health   │
               │   Validation Engine   │
               └───────────┬───────────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
  [Health Score >= 80]        [Health Score < 60]
             │                           │
             ▼                           ▼
    ┌─────────────────┐       ┌──────────────────────┐
    │  SQLite DB      │       │ bdata scraper heal   │
    │  & Dashboard    │       │ (Self-Healing Engine)│
    └─────────────────┘       └──────────┬───────────┘
                                         │
                                         ▼
                                ┌──────────────────┐
                                │ SAME c_* ID      │
                                │ RECOVERED & DATA │
                                │ FLOWS AGAIN      │
                                └──────────────────┘
```

---

## 📁 Repository Structure

```text
WebRescue/
├── app/
│   ├── api/               # REST API Endpoints (health, collectors, run, heal, validator)
│   ├── dashboard/         # Real-time Collector Health & Metrics Dashboard
│   ├── research/          # Autonomous AI Goal Planner Interface
│   ├── collectors/        # Collector Registry UI
│   ├── runs/              # Raw vs Normalized Scraper Execution Logs
│   └── history/           # Self-Healing Audit Trail UI
│
├── lib/
│   ├── brightdata/        # Bright Data CLI (`bdata`) execution wrappers
│   ├── scraper/           # Data normalizer & Prisma DB persistence helpers
│   ├── validator/         # 4-Tier Data Validation & Health Score Engine
│   ├── healing/           # bdata scraper heal Orchestration Controller
│   ├── ai/                # Autonomous Agent Goal Planner & Synthesizer
│   └── database/          # Prisma Client Singleton
│
├── prisma/
│   └── schema.prisma      # SQLite Database Schema
│
├── scripts/
│   ├── test-brightdata.ts      # Real Collector ID creation & run test
│   ├── test-healing.ts         # Failure detection & bdata scraper heal test
│   └── test-full-pipeline.ts   # 10-Step Full Architecture Test Suite
│
├── .env.example           # Environment template (NO secrets)
├── PROJECT_DOCUMENTATION.md
└── README.md
```

---

## 🛠️ Step-by-Step Setup & Reproducibility Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/RautDayanand/WebRescue.git
cd WebRescue
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Confirm `.env` settings:
```env
DATABASE_URL="file:./dev.db"
BRIGHTDATA_DEFAULT_COLLECTOR_ID="<your-collector-id>" # e.g. "c_mt5uny9822ng9wnh" (Demonstrated Production Collector)
```
*(Note: WebRescue will dynamically generate a new Bright Data Scraper Studio Collector on first run if no default ID is provided.)*

### 3. Initialize SQLite Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Authenticate Bright Data CLI
```bash
npx -p @brightdata/cli bdata login
```

### 5. Launch Local Dashboard
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suite

Run the verification scripts to reproduce the full pipeline:

```bash
# 1. Verify Real Bright Data Collector Execution (c_mt5uny9822ng9wnh)
npx tsx scripts/test-brightdata.ts

# 2. Verify Self-Healing Engine (Failure -> Detect -> Heal -> Recover)
npx tsx scripts/test-healing.ts

# 3. Verify Complete 10-Step Architecture Pipeline
npx tsx scripts/test-full-pipeline.ts

# 4. Production Build Verification
npm run build
```

---

## 🎬 4-Minute Submission Demo Video Script Outline

| Time | Scene | Script / Talking Points |
| :--- | :--- | :--- |
| **0:00 - 0:25** | **The Silent Failure Problem** | *"Traditional web scrapers break silently when website layouts change. Status codes return 200 OK, but your database gets populated with empty null values. WebRescue fixes this."* |
| **0:25 - 1:00** | **WebRescue Overview & Dashboard** | Show Next.js Dashboard (`http://localhost:3000`). Point out active Collectors, Health Scores, and Scraper Runs. |
| **1:00 - 1:45** | **Real Bright Data Integration** | Show terminal command `bdata scraper run c_mt5uny9822ng9wnh`. Highlight real structured JSON extracted from live public targets. |
| **1:45 - 2:30** | **The Hero Moment (Drift Detection)** | Simulate layout change / extraction drift. Show Scraper Health Score drop from **94/100 ➔ 31/100 (CRITICAL DRIFT)**. |
| **2:30 - 3:30** | **Self-Healing in Action** | Show automated execution of `bdata scraper heal c_mt5uny9822ng9wnh`. Show Health Score recover to **96/100 (HEALTHY)** using the **SAME Collector ID**. |
| **3:30 - 4:00** | **Conclusion & Downstream Pipeline** | *"WebRescue doesn't just scrape data. It's an autonomous reliability layer that keeps downstream AI applications alive when the web changes."* |
