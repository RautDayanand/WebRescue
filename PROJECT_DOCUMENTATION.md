# 🕷️ WebRescue — Complete Master Project Documentation

> **WebRescue**: The web-data agent that fixes its own broken scrapers. Give it a goal → It finds public data → Builds scrapers → Validates results → Detects website layout changes → Repairs scrapers → Keeps your data flowing.

---

## 📑 Table of Contents
1. [Executive Summary & Hero Differentiator](#-executive-summary--hero-differentiator)
2. [Hero Demo Moment: Before vs After Website Redesign](#-hero-demo-moment-before-vs-after-website-redesign)
3. [Live Self-Healing Timeline & Scraper Health Score](#-live-self-healing-timeline--scraper-health-score)
4. [AI Diagnosis Explanation ("Why Did It Heal?")](#-ai-diagnosis-explanation-why-did-it-heal)
5. [Tech Stack & Architecture](#-tech-stack--architecture)
6. [10-Step Build Pipeline Breakdown](#-10-step-build-pipeline-breakdown)
7. [Database Schema (Prisma SQLite)](#-database-schema-prisma-sqlite)
8. [API Reference Directory](#-api-reference-directory)
9. [Automated Verification Scripts](#-automated-verification-scripts)
10. [Hackathon Pitch & Judging Score Guide](#-hackathon-pitch--judging-score-guide)

---

## 💡 Executive Summary & Hero Differentiator

Traditional web scrapers break silently whenever target websites redesign their layout, change class names, or restructure DOM trees. Developers spend countless hours inspecting broken CSS selectors and fixing extraction scripts.

**WebRescue** solves this by creating an **autonomous, self-healing web-data agent** powered by Bright Data Scraper Studio:

```text
USER GOAL ➔ AI PLANNER ➔ SOURCE DISCOVERY ➔ SCRAPER GENERATOR ➔ BRIGHT DATA RUN ➔ NORMALIZATION ➔ VALIDATION ➔ (SELF-HEAL IF BROKEN) ➔ FINAL SYNTHESIZED ANSWER
```

### Key Differentiators:
- **Autonomous Scraper Generation**: Turns natural language intents into production-ready Bright Data Collector IDs (`c_...`).
- **Scraper Health Score (0–100)**: Real-time calculation of scraper health based on completeness, type purity, range bounds, and anomalies.
- **Four-Tier Data Validation**: Detects schema completeness drops and `EXTRACTION_DRIFT` (e.g. price completeness dropping from 96% to 12%).
- **AI Failure Diagnosis**: Explains *why* the scraper broke, detected DOM changes, and formulated repair strategy with confidence scores.
- **Automated Self-Healing 🔥**: Triggers `bdata scraper heal <collector_id> "<whatBroke>"` via CLI, re-executes the scraper, re-validates the dataset, and verifies recovery.
- **Safety Safeguards**: Caps repair loops (`MAX_HEAL_ATTEMPTS = 2`) and supports Healing Modes (`AUTOMATIC` | `APPROVAL_REQUIRED`).

---

## 🎬 Hero Demo Moment: Before vs After Website Redesign

WebRescue features an interactive **DOM Website Redesign & Drift Simulator**:

```text
1. INITIAL HEALTHY WEBSITE HTML
<div class="product-price">₹74,999</div>
Price Completeness: 96% (48/50)
Scraper Health Score: 94/100 🟢 HEALTHY

               ↓  (Website Redesigns DOM Structure)

2. REDESIGNED WEBSITE HTML (BROKEN)
<div data-testid="price-container"><span class="amount">₹74,999</span></div>
Extraction Outcome: price = null
Price Completeness: 12% (6/50) 🔴 EXTRACTION_DRIFT
Scraper Health Score: 31/100 🚨 CRITICAL DRIFT

               ↓  (WebRescue AI Failure Diagnosis)

3. 🧠 AI FAILURE DIAGNOSIS & REPAIR STRATEGY
Detected: DOM selector ".product-price" broken after site redesign. Price field completeness dropped 96% -> 12%.
Strategy: Locate "price" using semantic description, preserve schema, update Bright Data rules.
Confidence: 94%

               ↓  (Bright Data Scraper Heal)

4. 🔧 BRIGHT DATA HEAL EXECUTION
Command: bdata scraper heal c_drift_demo_789

               ↓  (Re-Run & Re-Validate)

5. ✅ RECOVERED DATASET
Price Completeness: 94% (47/50) 🟢
Health Score Recovery: 31/100 ➔ 97/100 ✅
```

Run this demo anytime via terminal:
```bash
npx tsx scripts/demo-drift-simulation.ts
```
Or click **🔥 Run Drift Simulation Demo** in the `/history` web page!

---

## 📊 Live Self-Healing Timeline & Scraper Health Score

Every collector and event presents a **7-Step Live Healing Timeline**:

```text
🟢 HEALTHY ➔ 🔴 DRIFT DETECTED ➔ 🧠 AI DIAGNOSING ➔ 🔧 REPAIRING ➔ ▶️ RE-RUN ➔ 🔍 VALIDATING ➔ ✅ RECOVERED
```

### Completeness & Score Metric Panel:
```text
Before Failure:     Price 96% 🟢  |  Health Score: 94/100
After Drift:        Price 12% 🔴  |  Health Score: 31/100 (🚨 DRIFT)
After Recovery:     Price 94% 🟢  |  Health Score: 97/100 (✅ RECOVERED)
```

---

## 🧠 AI Diagnosis Explanation ("Why Did It Heal?")

Instead of acting as a silent wrapper, WebRescue presents structured diagnosis reports:

```json
{
  "detectedBreakage": "DOM selector \".product-price\" broken after site redesign. Price field completeness dropped 96% -> 12%.",
  "repairStrategy": "Locate \"price\" using semantic fallback selectors, preserve output schema, and update Bright Data extraction rules.",
  "confidence": 0.94
}
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Glassmorphic Dark Theme
- **Backend**: Next.js API Routes & Node.js Server Handlers
- **Database**: SQLite (Prisma ORM) with 4 linked models (`ResearchGoal`, `Collector`, `ScraperRun`, `HealingEvent`)
- **Web Data Scraping**: Bright Data Scraper Studio & `@brightdata/cli` (`bdata` / `brightdata`)
- **AI Intelligence**: Provider-Independent Engine (OpenAI `gpt-4o-mini` with deterministic NLP fallback)
- **CI / Automation**: GitHub Actions (`scheduled-scrape.yml`)

---

## 🗄️ Database Schema (Prisma SQLite)

`prisma/schema.prisma`:

```prisma
model Collector {
  id            String         @id @default(uuid())
  collectorId   String         @unique // Bright Data collector ID (e.g. c_12345)
  name          String
  url           String
  fields        String         // JSON string of targeted fields
  status        String         @default("ACTIVE") // ACTIVE, DEGRADED, REPAIRED, FAILED
  healthScore   Int            @default(100) // Health score 0-100
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  runs          ScraperRun[]
  healingEvents HealingEvent[]
}

model HealingEvent {
  id                String    @id @default(uuid())
  collectorId       String
  triggerReason     String
  whatBroke         String
  aiDiagnosis       String?   // Structured AI diagnosis & repair strategy JSON
  healthScoreBefore Int?      // Score before healing (e.g. 31)
  healthScoreAfter  Int?      // Score after healing (e.g. 97)
  healingMode       String    @default("AUTOMATIC") // AUTOMATIC, APPROVAL_REQUIRED
  status            String    @default("IN_PROGRESS") // IN_PROGRESS, HEALED, RECOVERED, FAILED, ESCALATED
  resolution        String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  collector         Collector @relation(fields: [collectorId], references: [id], onDelete: Cascade)
}
```

---

## 📡 API Reference Directory

| Endpoint | Method | Payload | Description |
|---|---|---|---|
| `/api/health` | `GET` | None | Service readiness & SQLite DB health check |
| `/api/research/plan` | `POST` | `{ "goal": string }` | Generates structured AI research plan |
| `/api/research/discover` | `POST` | `{ "plan": StructuredPlan }` | Matches candidate public target web sources |
| `/api/scraper/generate` | `POST` | `{ "plan": Plan, "source": Source }` | Formulates prompt & creates Bright Data Collector |
| `/api/collectors` | `GET` / `POST` | `{ "url": string, "description": string }` | List or register Bright Data collectors |
| `/api/collectors/run` | `POST` | `{ "collectorId": string, "url": string }` | Executes scraper, normalizes, & persists run |
| `/api/validator/check` | `POST` | `{ "data": any[], "schema": object }` | Runs 4-tier validation & health score calculation |
| `/api/healing/trigger` | `POST` | `{ "collectorId": string, "targetUrl": string }` | Executes `bdata scraper heal` self-healing |
| `/api/healing/simulate` | `POST` | None | Triggers DOM Website Redesign Drift Simulation |
| `/api/research/execute` | `POST` | `{ "prompt": string }` | Runs 1-Click end-to-end Autonomous Agent loop |

---

## 🧪 Automated Verification Scripts

```bash
# Hero Demo: Before vs After DOM Drift Simulation
npx tsx scripts/demo-drift-simulation.ts

# Complete 10-Step Architecture Test
npx tsx scripts/test-full-pipeline.ts

# End-to-End Autonomous Agent Test
npx tsx scripts/test-agent.ts

# Self-Healing Orchestrator Test
npx tsx scripts/test-healing.ts

# Production Build Verification
npm run build
```
