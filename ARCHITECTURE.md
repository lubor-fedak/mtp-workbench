# MTP Workbench — Browser Extension Architecture

> Product layer over the MTP (Methodology Transfer Protocol) open specification.
> "The spec is the engine. The extension is the car."

---

## 1. Vision

A browser extension that serves as a **local knowledge hub between AI platforms**. Users build contextual workspaces — projects with collected snippets, extracted methodologies, and execution history — and compose platform-aware prompts for any LLM tool.

**Core principles:**
- Fully local processing — no data leaves the browser
- Zero backend, zero registration, zero cloud sync
- No YAML visible to users — MTP packages are visual cards with steps
- Free, open-source (Apache 2.0)
- Human-in-the-loop orchestration across multiple LLM windows

**Positioning:**
MTP Workbench is NOT a prompt manager. It is a methodology workspace with execution tracking and drift measurement. The user develops methodology in capable commercial AI (Claude, ChatGPT Pro), transfers it to enterprise AI (Copilot, Azure OpenAI) that has access to real data, and MTP Workbench quantifies how much the methodology degraded in transit.

---

## 2. Core Concept

```
+---------------------------------------------------+
|                  MTP Workbench                     |
|                                                    |
|  +----------+  +----------+  +----------+         |
|  | Project A |  | Project B |  |  Chat X  |        |
|  | (folder)  |  | (folder)  |  | (quick)  |        |
|  |           |  |           |  |          |         |
|  | contexts/ |  | contexts/ |  | context  |         |
|  | packages/ |  | packages/ |  | snippets |         |
|  | reports/  |  | reports/  |  |          |         |
|  +----------+  +----------+  +----------+         |
|                                                    |
|  +-------------------------------------------+    |
|  |     Active Context Panel (sidebar)         |    |
|  |  > selected snippets + package refs        |    |
|  |  > auto-composed prompt preview            |    |
|  |  > one-click inject into any LLM tab       |    |
|  +-------------------------------------------+    |
+---------------------------------------------------+
         |              |              |
    Claude.ai      ChatGPT.com    Copilot.ms
```

---

## 3. Main Features

### A) Capture — collecting context

- **Content Scripts** on supported AI platforms (Claude, ChatGPT, Gemini, Copilot)
- User selects text in conversation > right-click > "Save to MTP Workbench"
- Or full conversation > "Extract methodology" (calls mtp-extract logic compiled to TS)
- Auto-tagging: source platform, timestamp, topic (heuristic from first sentences)
- No YAML visible — internal MTP packages are under the hood

### B) Organize — projects and contexts

- **Projects** = folders with name, description, tags, visual identity (icon, color)
- Inside a project:
  - **Context Snippets** — short excerpts (rules, definitions, decisions)
  - **Methodology Packages** — extracted MTP packages (displayed as visual cards with steps, not YAML)
  - **Execution Reports** — application results (drift score as visual gauge)
  - **Dead Ends** — what didn't work (critical for MTP philosophy)
- **Quick Chats** = one-off contexts without a project (inbox-style)
- Drag & drop between projects, tagging, search, filters

### C) Compose — prompt assembly

This is the killer feature.

```
+-------------------------------------------+
|  Compose Prompt                      [AI] |
|                                           |
|  [x] Project: Churn Analysis              |
|    [x] Context: "segment definitions"     |
|    [x] Context: "KPI thresholds"          |
|    [x] Package: "churn-risk-scoring"      |
|    [ ] Dead End: "random forest approach"  |
|                                           |
|  + Add instruction layer:                 |
|  "Apply this to Q1 2026 data, focus       |
|   on enterprise segment only"             |
|                                           |
|  Target: [ChatGPT v]  Format: [Auto v]   |
|                                           |
|  +-------------------------------------+ |
|  |  Preview (auto-generated):           | |
|  |  You are executing a validated       | |
|  |  methodology for churn risk...       | |
|  |  [Context: segment definitions]      | |
|  |  [Steps: 1-5 with semantics]         | |
|  |  [Avoid: random forest - see...]     | |
|  |  Task: Apply to Q1 2026...           | |
|  +-------------------------------------+ |
|                                           |
|  [Copy]  [Inject into active tab]         |
+-------------------------------------------+
```

- User selects context snippets via checkboxes
- Extension auto-composes prompt with respect to **target platform** (Claude gets different format than Copilot)
- **Platform-aware prompt generation** — knows context window limits of target platform
- "Inject" inserts directly into the text field of the active AI tab

### D) Track — result tracking

- After injection, user works with AI normally
- When done > "Capture result" > extension compares output with expected output from MTP package
- **Drift score** displayed visually (gauge 0-100%, color-coded)
- History: when, where, with what drift score was the methodology used
- Trends: "Churn scoring works better on Claude (0.94) than on Copilot (0.71)"

### E) Share (v2+)

- Export project as `.mtp-workspace` (ZIP with JSON, not YAML)
- Import workspace from colleague
- No cloud sync in v1 — fully local

---

## 4. Customization & Personalization

### Project visual identity

Each project/chat has a configurable card:

- **Icon** — selection from Lucide Icons library (1500+ icons, MIT license, consistent style)
  - Categories: Analytics, Finance, Marketing, Engineering, HR, Custom...
  - Or emoji picker as fallback
- **Color** — accent color for project (border-left, header background)
  - Default palette of 12-16 colors (material-style, muted)
  - Custom color picker for power users
- **Avatar** — optional, small image (base64, max 64x64px, stored in IndexedDB)

### Global theme

```
+-- Appearance ------------------------------------+
|                                                   |
|  Theme:    (*) System  ( ) Light  ( ) Dark        |
|                                                   |
|  Accent:   [########] #6366f1                     |
|                                                   |
|  Font:     [Inter                    v]           |
|            ( ) System default                     |
|            ( ) Inter (clean, modern)              |
|            ( ) JetBrains Mono (technical)         |
|            ( ) IBM Plex Sans (enterprise)         |
|                                                   |
|  Density:  ( ) Compact  (*) Default  ( ) Relaxed  |
|                                                   |
|  Sidebar width:  [=====*===] 360px                |
|                                                   |
+---------------------------------------------------+
```

- **Theme** — light/dark/system with smooth transition (`prefers-color-scheme`)
- **Accent color** — global accent (buttons, links, active states); project-level color overrides within that project
- **Font** — 3-4 bundled fonts + system default. Fonts bundled in extension (no Google Fonts — no external requests, privacy-first)
- **Density** — compact/default/relaxed changes padding and font-size

### Project creation flow

```
+-- New Project -----------------------------------+
|                                                   |
|  Name:  [Churn Risk Analysis________]             |
|                                                   |
|  Icon:  [target] <- click to change               |
|         +----------------------------+            |
|         | emoji:  target chart flask  |            |
|         | lucide: microscope bulb... |            |
|         +----------------------------+            |
|                                                   |
|  Color: (o)(o)(o)(o)(o)(o)(o)(o)                  |
|          ^^ selected                              |
|                                                   |
|  Description: [optional_____________]             |
|  Tags:        [churn, ml, scoring____]            |
|                                                   |
|            [Cancel]  [Create Project]             |
+---------------------------------------------------+
```

Analogous to Claude Projects, ChatGPT GPTs, or Notion — nothing new to learn.

---

## 5. Technical Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Extension framework | **WXT** | Cross-browser (Chrome + Firefox + Edge), TypeScript-native, HMR dev |
| UI framework | **Svelte 5** or **SolidJS** | Minimal bundle size (critical for extension), reactivity |
| Storage | **IndexedDB** (via Dexie.js) | Structured data, large volumes, fully local |
| MTP core logic | **TypeScript port** of mtp-lint + mtp-extract | Existing Python toolchain ported to TS for browser runtime |
| Schema validation | **Ajv** (JSON Schema Draft 2020-12) | Same schemas as in mtp-spec repository |
| Prompt composition | Custom engine | Platform-specific templates + context assembly |
| Content scripts | Per-platform injectors | DOM manipulation for Claude/ChatGPT/Gemini/Copilot |
| Packaging | **Vite** (via WXT) | Tree-shaking, code splitting popup vs sidebar vs content |
| Icons | **Lucide** | 1500+ icons, MIT, consistent, tree-shakeable |
| CSS | **CSS custom properties** | Theming via variables, no runtime CSS-in-JS overhead |

---

## 6. Directory Structure

```
mtp-workbench/
├── src/
│   ├── background/               # Service Worker
│   │   ├── index.ts              # Message router
│   │   ├── storage.ts            # IndexedDB (Dexie) — projects, snippets, packages
│   │   └── mtp-core/             # Ported mtp-lint, mtp-extract, drift calc
│   │
│   ├── content-scripts/          # Per-platform DOM integration
│   │   ├── claude.ts             # claude.ai injection/extraction
│   │   ├── chatgpt.ts            # chatgpt.com
│   │   ├── gemini.ts             # gemini.google.com
│   │   ├── copilot.ts            # copilot.microsoft.com
│   │   └── common.ts             # Shared selection/injection utilities
│   │
│   ├── sidebar/                  # Main UI (Side Panel API)
│   │   ├── App.svelte
│   │   ├── views/
│   │   │   ├── Projects.svelte         # Project list + CRUD
│   │   │   ├── ProjectDetail.svelte    # Contexts, packages, reports
│   │   │   ├── Compose.svelte          # Prompt builder
│   │   │   ├── Capture.svelte          # Review captured content
│   │   │   ├── DriftDashboard.svelte   # Cross-platform drift trends
│   │   │   └── Settings.svelte         # Theme, font, density, accent
│   │   └── components/
│   │       ├── SnippetCard.svelte
│   │       ├── MethodologyView.svelte  # Visual step viewer (not YAML)
│   │       ├── DriftGauge.svelte
│   │       ├── PlatformSelector.svelte
│   │       ├── IconPicker.svelte       # Lucide + emoji picker
│   │       ├── ColorPicker.svelte      # Preset palette + custom
│   │       └── ThemeProvider.svelte    # CSS variable injection
│   │
│   ├── popup/                    # Quick actions (capture, compose shortcut)
│   │   └── Popup.svelte
│   │
│   └── shared/
│       ├── types.ts              # Project, Snippet, Package, Report, Theme types
│       ├── platforms.ts          # Platform detection + capabilities
│       ├── prompt-engine.ts      # Context -> prompt composition per platform
│       └── theme.ts              # Theme defaults, CSS variable mapping
│
├── assets/
│   ├── fonts/                    # Bundled fonts (Inter, JetBrains Mono, IBM Plex Sans)
│   └── icons/                    # Extension icons (16, 32, 48, 128px)
│
├── schemas/                      # Referenced from mtp-spec/schema/
├── wxt.config.ts
├── package.json
├── tsconfig.json
└── ARCHITECTURE.md               # This document
```

---

## 7. Data Model

```typescript
// --- Appearance ---

interface ProjectAppearance {
  icon: string;                // lucide icon name ("target") or emoji
  icon_type: 'lucide' | 'emoji';
  color: string;               // hex "#6366f1"
  avatar?: string;             // base64 data URI, optional
}

interface GlobalTheme {
  mode: 'system' | 'light' | 'dark';
  accent: string;              // hex
  font: 'system' | 'inter' | 'jetbrains-mono' | 'ibm-plex-sans';
  density: 'compact' | 'default' | 'relaxed';
  sidebar_width: number;       // px, 280-500
}

// --- Core ---

interface Project {
  id: string;                  // uuid
  name: string;
  description?: string;
  tags: string[];
  appearance: ProjectAppearance;
  created_at: string;          // ISO 8601
  updated_at: string;
  sort_order: number;
}

interface ContextSnippet {
  id: string;
  project_id: string;
  title: string;
  content: string;             // raw text
  source_platform: Platform;
  source_url?: string;
  tags: string[];
  created_at: string;
}

interface MethodologyPackage {
  id: string;
  project_id: string;
  display_name: string;
  summary: string;             // auto-generated from package
  step_count: number;
  edge_case_count: number;
  dead_end_count: number;
  mtp_package: object;         // full MTP v0.2 package (hidden from UI)
  source_platform: Platform;
  created_at: string;
}

interface ExecutionRecord {
  id: string;
  project_id: string;
  package_id: string;
  target_platform: Platform;
  drift_score: number;         // 0.0-1.0
  drift_components: object;    // 7 MTP drift components
  overall_status: ExecutionStatus;
  notes?: string;
  mtp_report: object;          // full MTP execution report (hidden from UI)
  executed_at: string;
}

type Platform = 'claude' | 'chatgpt' | 'gemini' | 'copilot' | 'other';
type ExecutionStatus = 'success' | 'partial' | 'deviation' | 'failure' | 'skipped' | 'escalated';
```

---

## 8. CSS Theming System

```css
:root {
  /* User-configurable */
  --mtp-accent: var(--user-accent, #6366f1);
  --mtp-font: var(--user-font, 'Inter', system-ui, sans-serif);
  --mtp-radius: var(--density-radius, 8px);
  --mtp-spacing: var(--density-spacing, 12px);
  --mtp-font-size: var(--density-font-size, 14px);

  /* Light theme (default) */
  --mtp-bg: #ffffff;
  --mtp-surface: #f8fafc;
  --mtp-surface-hover: #f1f5f9;
  --mtp-border: #e2e8f0;
  --mtp-text: #0f172a;
  --mtp-text-secondary: #64748b;
}

[data-theme="dark"] {
  --mtp-bg: #0f172a;
  --mtp-surface: #1e293b;
  --mtp-surface-hover: #334155;
  --mtp-border: #334155;
  --mtp-text: #e2e8f0;
  --mtp-text-secondary: #94a3b8;
}

/* Density presets */
[data-density="compact"] {
  --density-radius: 4px;
  --density-spacing: 8px;
  --density-font-size: 13px;
}

[data-density="relaxed"] {
  --density-radius: 12px;
  --density-spacing: 16px;
  --density-font-size: 15px;
}
```

---

## 9. Primary UX Flow

```
1. User works in Claude > develops methodology for churn analysis
2. Selects conversation > right-click > "Extract to MTP Workbench"
3. Extension extracts package (under the hood), displays as card:
   "Churn Risk Scoring - 5 steps, 4 edge cases, 3 dead ends"
4. User switches to ChatGPT (has access to company data)
5. Clicks MTP icon > Compose > selects package + adds instruction
6. "Inject" > prompt inserted into ChatGPT
7. ChatGPT executes methodology
8. User clicks "Capture result"
9. Extension calculates drift score: 0.87
   > "Step 3 had deviation: used random forest instead of gradient boosting"
10. Dashboard shows trend over time and across platforms
```

---

## 10. Differentiators

| Existing solution | What it does | What MTP Workbench adds |
|-------------------|-------------|------------------------|
| TypingMind, PromptLayer | Prompt management | **Methodology** not prompt — steps, edge cases, dead ends, drift |
| Notion/Obsidian AI templates | Knowledge base | **Execution tracking** — knows whether methodology was preserved |
| Browser-native bookmarks/notes | Storage | **Platform-aware injection** — knows where and how to insert |
| Copy-paste | Transfer | **Drift measurement** — quantifies degradation |

---

## 11. Development Phases

### Phase 1 — Core (MVP)
- Capture + Organize + Manual Copy
- Projects/folders, context snippets, basic capture from AI platforms
- Manual copy prompt from compose view
- IndexedDB storage, Chrome-only
- Customization: project icons, colors, global theme

### Phase 2 — Smart
- Compose + Inject + Platform awareness
- Auto-compose engine, direct injection into AI platforms
- Platform-specific prompt formatting
- MTP package extraction (port mtp-extract to TS)

### Phase 3 — Measure
- Track + Drift
- Capture results, drift scoring
- Dashboard with trends
- Cross-platform comparison

### Phase 4 — Collaborate
- Share + Import/Export
- Workspace export/import
- Firefox + Edge support

---

## 12. Key Architectural Decisions

1. **Side Panel API** (not popup) — sidebar is persistent, user has it open while working with AI
2. **Zero-backend** — everything in IndexedDB, no server, no registration
3. **Content scripts are thin** — only DOM manipulation, logic lives in service worker
4. **MTP is invisible** — user never sees YAML, packages are visual cards with steps
5. **Platform detection is pluggable** — new platforms = new content script, no changes to core
6. **Fonts bundled** — no external requests, privacy-first
7. **CSS custom properties** — theming without runtime overhead
8. **Lucide for icons** — tree-shakeable, consistent, MIT licensed

---

## References

- MTP Specification: [mtp-spec](https://github.com/luborfedak/mtp-spec)
- MTP Spec v0.2: `mtp-spec/spec/MTP-SPEC-v0.2.md`
- MTP Schemas: `mtp-spec/schema/`
- WXT Framework: https://wxt.dev
- Svelte 5: https://svelte.dev
- Dexie.js: https://dexie.org
- Lucide Icons: https://lucide.dev
- Ajv: https://ajv.js.org
