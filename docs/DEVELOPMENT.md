# MTP Workbench -- Developer Guide

This document covers the project structure, conventions, and how to extend MTP Workbench.

---

## Project Structure

```
mtp-workbench/
├── src/
│   ├── entrypoints/                  # WXT entrypoints (each becomes a bundle)
│   │   ├── background.ts            # Service worker: message router
│   │   ├── claude.content.ts        # Content script for claude.ai
│   │   ├── chatgpt.content.ts       # Content script for chatgpt.com
│   │   ├── gemini.content.ts        # Content script for gemini.google.com
│   │   ├── copilot.content.ts       # Content script for copilot.microsoft.com
│   │   ├── popup/                   # Extension popup
│   │   │   ├── main.ts
│   │   │   └── Popup.svelte
│   │   └── sidepanel/               # Main UI (Chrome Side Panel)
│   │       ├── main.ts
│   │       ├── App.svelte           # Root component, view router
│   │       ├── views/               # Full-page views
│   │       │   ├── Projects.svelte
│   │       │   ├── ProjectDetail.svelte
│   │       │   ├── Compose.svelte
│   │       │   ├── Capture.svelte
│   │       │   ├── DriftDashboard.svelte
│   │       │   └── Settings.svelte
│   │       └── components/          # Reusable UI components
│   │           ├── Navigation.svelte
│   │           ├── SnippetCard.svelte
│   │           ├── MethodologyView.svelte
│   │           ├── DriftGauge.svelte
│   │           ├── PlatformSelector.svelte
│   │           ├── IconPicker.svelte
│   │           ├── ColorPicker.svelte
│   │           └── ThemeProvider.svelte
│   ├── lib/                          # Core logic modules
│   │   ├── storage.ts               # Dexie.js database, CRUD operations
│   │   ├── common.ts                # Shared content script utilities
│   │   └── mtp-core/
│   │       └── index.ts             # MTP validation, extraction, drift calc
│   └── shared/                       # Types and utilities shared across bundles
│       ├── types.ts                 # TypeScript interfaces and type aliases
│       ├── platforms.ts             # Platform detection and capabilities
│       ├── prompt-engine.ts         # Context-to-prompt composition engine
│       └── theme.ts                 # Theme defaults, CSS variable mapping
├── assets/
│   ├── fonts/                        # Bundled fonts (Inter, JetBrains Mono, IBM Plex Sans)
│   └── icons/                        # Extension icons (16, 32, 48, 128px)
├── public/                           # Static files copied to output
├── wxt.config.ts                     # WXT configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json
```

---

## WXT Framework

MTP Workbench uses [WXT](https://wxt.dev), a framework for building cross-browser extensions with TypeScript. Key conventions:

### Entrypoints

WXT uses filename conventions in the `src/entrypoints/` directory to determine what to build:

- `background.ts` -- Becomes the extension's service worker.
- `*.content.ts` -- Content scripts. The filename prefix determines the script name (e.g., `claude.content.ts`). Match patterns for content scripts are defined inside each file using `defineContentScript()`.
- `popup/` -- Directory with `main.ts` creates the popup page.
- `sidepanel/` -- Directory with `main.ts` creates the side panel page.

### Configuration

The `wxt.config.ts` file defines:
- `srcDir: 'src'` -- Source directory.
- `modules: ['@wxt-dev/module-svelte']` -- Enables Svelte support.
- `manifest` -- Chrome extension manifest fields (name, permissions, icons).

### Permissions

The extension uses these Chrome permissions:
- `sidePanel` -- Opens the sidebar via the Side Panel API.
- `activeTab` -- Accesses the current tab for content script communication.
- `contextMenus` -- Adds the right-click "Save to MTP Workbench" menu item.
- `storage` -- Chrome storage API (used alongside IndexedDB).

---

## Adding a New AI Platform

To add support for a new AI platform (e.g., Perplexity):

### 1. Create the Content Script

Create `src/entrypoints/perplexity.content.ts`:

```typescript
import { defineContentScript } from 'wxt/sandbox';

export default defineContentScript({
  matches: ['https://www.perplexity.ai/*'],
  main() {
    // Platform-specific DOM integration
    // Keep this thin -- logic belongs in the service worker
  },
});
```

### 2. Add the Platform Type

In `src/shared/types.ts`, add the new platform to the `Platform` type:

```typescript
export type Platform = 'claude' | 'chatgpt' | 'gemini' | 'copilot' | 'perplexity' | 'other';
```

### 3. Register Platform Capabilities

In `src/shared/platforms.ts`, add the new platform's details (display name, context window size, URL pattern).

### 4. Update the Prompt Engine

If the new platform requires different prompt formatting, update `src/shared/prompt-engine.ts` with platform-specific templates.

Content scripts should remain thin. Their job is DOM manipulation only -- reading selected text, detecting the platform, and (in Phase 2+) injecting prompts into the text input. All business logic runs in the background service worker.

---

## Adding a New Sidebar View

### 1. Create the View Component

Create a new Svelte file in `src/entrypoints/sidepanel/views/`:

```svelte
<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';

  interface Props {
    onBack: () => void;
  }

  let { onBack }: Props = $props();
</script>

<div class="my-view">
  <div class="view-header">
    <button class="btn-icon" onclick={onBack} aria-label="Back">
      <ArrowLeft size={18} />
    </button>
    <h2>My View</h2>
  </div>

  <!-- View content -->
</div>
```

### 2. Register in the View Router

Add the new view to the `SidebarView` type in `src/shared/types.ts`:

```typescript
export type SidebarView =
  | 'projects'
  | 'project-detail'
  | 'compose'
  | 'capture'
  | 'drift'
  | 'settings'
  | 'my-view';
```

### 3. Add Navigation

Update `App.svelte` to handle the new view in its routing logic, and optionally add it to `Navigation.svelte`.

---

## CSS Theming System

MTP Workbench uses CSS custom properties for theming. No CSS-in-JS runtime is involved.

### Core Variables

```css
/* User-configurable */
--mtp-accent     /* Accent color (buttons, links, active states) */
--mtp-font       /* Font family */
--mtp-radius     /* Border radius (controlled by density) */
--mtp-spacing    /* Base spacing (controlled by density) */
--mtp-font-size  /* Base font size (controlled by density) */

/* Theme-dependent (light/dark) */
--mtp-bg              /* Page background */
--mtp-surface         /* Card/panel background */
--mtp-surface-hover   /* Hover state */
--mtp-border          /* Border color */
--mtp-text            /* Primary text */
--mtp-text-secondary  /* Secondary text */
```

### How Theming Works

1. `ThemeProvider.svelte` reads the user's theme settings from IndexedDB.
2. It sets a `data-theme` attribute (`light` or `dark`) and a `data-density` attribute (`compact`, `default`, or `relaxed`) on the root element.
3. CSS rules in the global stylesheet map these attributes to variable values.
4. All components reference the variables (e.g., `color: var(--mtp-text)`), never hardcoded colors.

### Density Presets

| Density | Radius | Spacing | Font Size |
|---------|--------|---------|-----------|
| Compact | 4px | 8px | 13px |
| Default | 8px | 12px | 14px |
| Relaxed | 12px | 16px | 15px |

### Adding a New Theme Variable

1. Define it in the `:root` and `[data-theme="dark"]` blocks in the global CSS.
2. Reference it in components using `var(--mtp-variable-name)`.
3. If it should be user-configurable, add a control in `Settings.svelte` and persist it via the `GlobalTheme` interface.

---

## Storage Layer

### Dexie.js Database

All data is stored in IndexedDB using [Dexie.js](https://dexie.org). The database is defined in `src/lib/storage.ts`.

Tables:
- `projects` -- Project records with appearance, tags, and timestamps.
- `snippets` -- Context snippets linked to projects by `project_id`.
- `packages` -- Methodology packages linked to projects.
- `records` -- Execution records with drift scores, linked to projects and packages.
- `theme` -- Single-row table for global theme settings.

### Message Passing

The sidebar and content scripts do not access IndexedDB directly. All data flows through the background service worker using Chrome's message passing:

```
Sidebar/Content Script
    |
    |  chrome.runtime.sendMessage({ type, payload })
    v
Background Service Worker
    |
    |  Dexie.js CRUD
    v
IndexedDB
    |
    |  Response: { success, data?, error? }
    v
Sidebar/Content Script
```

Message types are defined in `src/shared/types.ts` as the `MessageType` union. The router in `src/entrypoints/background.ts` dispatches each message type to the appropriate storage function.

### Adding a New Message Type

1. Add the type string to the `MessageType` union in `src/shared/types.ts`.
2. Add a `case` in the `handleMessage` function in `src/entrypoints/background.ts`.
3. Implement the corresponding storage function in `src/lib/storage.ts`.

---

## Building and Testing

### Development Build

```bash
npm run dev
```

Starts the WXT dev server. Output goes to `.output/chrome-mv3-dev`. Load this directory as an unpacked extension in Chrome.

### Production Build

```bash
npm run build
```

Produces an optimized build in `.output/chrome-mv3`. Tree-shaking and minification are applied.

### Package as ZIP

```bash
npm run zip
```

Creates a `.zip` file ready for submission to the Chrome Web Store.

### Type Checking

```bash
npm run check
```

Runs `svelte-check` against the TypeScript configuration. This checks both TypeScript and Svelte files.

---

## Phase Roadmap

| Phase | Scope | Key Technical Work |
|-------|-------|--------------------|
| **Phase 1** (current) | Capture + Organize + Manual Copy | IndexedDB storage, Side Panel UI, context menu capture, prompt compose with clipboard copy |
| **Phase 2** | Compose + Inject + Platform awareness | Auto-compose engine, direct DOM injection into AI platforms, platform-specific prompt formatting, mtp-extract port to TypeScript |
| **Phase 3** | Track + Drift measurement | Result capture, drift scoring algorithm, dashboard with trends, cross-platform comparison |
| **Phase 4** | Share + Import/Export | Workspace export/import (.mtp-workspace ZIP), Firefox and Edge support via WXT |

---

## Related Resources

- [MTP Specification](https://github.com/luborfedak/mtp-spec) -- Protocol spec, JSON schemas, CLI tools
- [WXT Documentation](https://wxt.dev) -- Extension framework
- [Svelte 5 Documentation](https://svelte.dev) -- UI framework
- [Dexie.js Documentation](https://dexie.org) -- IndexedDB wrapper
- [Lucide Icons](https://lucide.dev) -- Icon library
