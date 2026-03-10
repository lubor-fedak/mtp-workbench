# MTP Workbench

**Local methodology workspace between AI platforms.**

MTP Workbench is a browser extension that helps you capture, organize, and transfer AI-developed methodologies across platforms. It is built on the [Methodology Transfer Protocol (MTP)](https://github.com/luborfedak/mtp-spec) open specification.

This is not a prompt manager. It is a methodology workspace with execution tracking and drift measurement. You develop methodology in a capable commercial AI (Claude, ChatGPT Pro), transfer it to an enterprise AI that has access to real data (Copilot, Azure OpenAI), and MTP Workbench helps you manage that process and eventually quantify how much the methodology degraded in transit.

---

## Key Features (Phase 1)

- **Capture** -- Select text on any supported AI platform, right-click, and save it to your local workspace.
- **Organize** -- Create projects with icons, colors, descriptions, and tags. Store context snippets and methodology packages inside projects.
- **Compose** -- Select context snippets and packages, choose a target platform, preview the composed prompt, and copy it to clipboard.
- **Customize** -- Light/dark/system theme, accent color, four bundled fonts, three density levels, adjustable sidebar width.
- **Privacy-first** -- Everything stays in your browser. No backend, no registration, no cloud sync, no external requests.

---

## Screenshots

*Screenshots will be added here after the first public release.*

---

## Installation

### From Source (Development)

```bash
git clone https://github.com/luborfedak/mtp-workbench.git
cd mtp-workbench
npm install
npm run dev
```

This starts the WXT dev server with hot module replacement.

### Loading in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable "Developer mode" (toggle in the top-right corner).
3. Click "Load unpacked".
4. Select the `.output/chrome-mv3-dev` directory inside the project folder.
5. The MTP Workbench icon appears in your extensions toolbar.

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR (Chrome) |
| `npm run dev:firefox` | Start dev server for Firefox |
| `npm run build` | Production build (Chrome) |
| `npm run build:firefox` | Production build (Firefox) |
| `npm run zip` | Build and package as ZIP (Chrome) |
| `npm run zip:firefox` | Build and package as ZIP (Firefox) |
| `npm run check` | Run svelte-check type checking |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Extension framework | WXT | Cross-browser, TypeScript-native, HMR dev |
| UI framework | Svelte 5 | Minimal bundle size, fine-grained reactivity |
| Storage | IndexedDB via Dexie.js | Structured local data, no backend |
| Schema validation | Ajv | JSON Schema Draft 2020-12 validation |
| Icons | Lucide | 1500+ tree-shakeable MIT icons |
| Fonts | Inter, JetBrains Mono, IBM Plex Sans | Bundled, no external requests |
| CSS | Custom properties | Theming without runtime overhead |
| Build | Vite (via WXT) | Tree-shaking, code splitting |

---

## How to Use

### Creating a Project

1. Click the MTP Workbench icon in the Chrome toolbar to open the sidebar.
2. On the Projects view, click "New Project".
3. Enter a project name and optional description.
4. Choose an icon (from the Lucide library or emoji picker) and an accent color.
5. Add tags to help with organization.
6. Click "Create Project" to save.

Each project acts as a folder that holds context snippets, methodology packages, and execution records.

### Capturing Text from AI Platforms

1. Navigate to a supported AI platform (Claude, ChatGPT, Gemini, or Copilot).
2. Select the text you want to capture.
3. Right-click and choose "Save to MTP Workbench".
4. The sidebar opens with the Capture view, where you can review the captured text.
5. Assign the snippet to a project, give it a title, and save.

The captured text is stored locally in IndexedDB along with the source platform and URL.

### Organizing Snippets and Packages

Inside a project, you can view and manage:

- **Context Snippets** -- Short excerpts such as rules, definitions, or decisions captured from AI conversations.
- **Methodology Packages** -- Extracted MTP packages displayed as visual cards with step counts and summaries (the underlying YAML/JSON is hidden from the UI).

### Composing Prompts

1. Open a project and navigate to the Compose view.
2. Select the context snippets and methodology packages you want to include using checkboxes.
3. Add an optional instruction layer (e.g., "Apply this to Q1 2026 data, focus on enterprise segment").
4. Choose a target platform from the platform selector.
5. Review the auto-generated prompt preview, including token count and context limit check.
6. Click "Copy to Clipboard" and paste into your target AI platform.

### Settings

Open Settings from the sidebar navigation to customize:

- **Theme** -- System (follows OS preference), Light, or Dark.
- **Accent Color** -- Choose from a preset palette or use a custom color.
- **Font** -- System Default, Inter (clean, modern), JetBrains Mono (technical, monospace), or IBM Plex Sans (enterprise, professional).
- **Density** -- Compact, Default, or Relaxed (controls spacing and font size).
- **Sidebar Width** -- Adjustable from 280px to 500px.

---

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome | Supported (Phase 1) |
| Firefox | Planned (Phase 4) |
| Edge | Planned (Phase 4) |

---

## Architecture

MTP Workbench uses the Chrome Side Panel API as its primary interface, with a service worker handling all business logic and storage.

```
Extension Icon / Context Menu
        |
   Background Service Worker (message router, IndexedDB storage)
        |
   +----+----+
   |         |
Sidebar    Content Scripts
(Svelte)   (claude, chatgpt, gemini, copilot)
```

- **Background service worker** -- Message routing, IndexedDB operations via Dexie.js, MTP core logic.
- **Sidebar (Side Panel)** -- Main UI built with Svelte 5. Contains views for Projects, Project Detail, Compose, Capture, Drift Dashboard, and Settings.
- **Content scripts** -- Thin, per-platform scripts for DOM interaction on supported AI platforms. Logic stays in the service worker.
- **Popup** -- Quick-action entry point.

For full architectural details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Capture + Organize + Manual Copy (Chrome-only) | Current |
| Phase 2 | Compose + Inject + Platform awareness | Planned |
| Phase 3 | Track + Drift measurement | Planned |
| Phase 4 | Share + Import/Export, Firefox + Edge | Planned |

---

## MTP Protocol

MTP Workbench is the product layer over the Methodology Transfer Protocol. The protocol specification, JSON schemas, and CLI tools live in a separate repository:

- **Spec repository:** [github.com/luborfedak/mtp-spec](https://github.com/luborfedak/mtp-spec)

Users of MTP Workbench never interact with MTP directly. The extension handles all protocol details internally and presents methodologies as visual cards with steps, edge cases, and dead ends.

---

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.

---

## Author

**Lubor Fedak** -- AI Evangelist & Business Leader for Europe at Kyndryl
