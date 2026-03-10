# Getting Started with MTP Workbench

This guide walks you through installing, loading, and using MTP Workbench for the first time.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** (included with Node.js)
- **Google Chrome** (MTP Workbench currently targets Chrome only)

Verify your Node.js version:

```bash
node --version   # should print v18.x.x or higher
npm --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/luborfedak/mtp-workbench.git
cd mtp-workbench
```

### 2. Install Dependencies

```bash
npm install
```

This also runs the `postinstall` script, which calls `wxt prepare` to generate WXT type declarations.

### 3. Start the Development Server

```bash
npm run dev
```

WXT compiles the extension and watches for changes. The output goes to `.output/chrome-mv3-dev`.

---

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click **Load unpacked**.
4. Browse to your project directory and select the `.output/chrome-mv3-dev` folder.
5. MTP Workbench now appears in your extensions toolbar. Pin it for easy access.

When the dev server is running, changes to the source code trigger hot module replacement. The sidebar and popup update automatically. Content script changes may require a page reload on the target AI platform.

---

## First Steps

### Create Your First Project

1. Click the MTP Workbench icon in the Chrome toolbar. The sidebar opens.
2. You land on the **Projects** view. Click **New Project**.
3. Fill in:
   - **Name** -- Give the project a descriptive name (e.g., "Churn Risk Analysis").
   - **Icon** -- Click the icon to open the picker. Choose from Lucide icons or emojis.
   - **Color** -- Select an accent color from the palette. This color is used for the project card border and header.
   - **Description** -- Optional. Add context about the project's purpose.
   - **Tags** -- Optional. Comma-separated labels for filtering later.
4. Click **Create Project**.

### Capture Text from an AI Platform

1. Navigate to a supported AI platform: claude.ai, chatgpt.com, gemini.google.com, or copilot.microsoft.com.
2. Have a conversation or open an existing one.
3. Select a passage of text -- a definition, a set of rules, a methodology step, or anything worth saving.
4. Right-click and choose **Save to MTP Workbench** from the context menu.
5. The MTP Workbench sidebar opens with the Capture view.
6. Review the captured text, assign it to a project, give it a title, and save it as a context snippet.

The snippet is stored locally in your browser's IndexedDB. It records the source platform and page URL automatically.

### Compose a Prompt

1. Open the sidebar and navigate to your project.
2. Click **Compose** to open the prompt builder.
3. Use checkboxes to select the context snippets and methodology packages you want to include.
4. Add an **instruction layer** in the text area -- specific directions for this execution (e.g., "Focus on enterprise segment, use Q1 2026 data").
5. Choose a **target platform** from the platform selector (Claude, ChatGPT, Gemini, Copilot).
6. Review the **preview** panel. It shows the auto-composed prompt along with an estimated token count and whether it fits within the target platform's recommended context limit.
7. Click **Copy to Clipboard**.
8. Switch to your target AI platform and paste.

---

## Settings

Access Settings from the sidebar navigation (gear icon). Available options:

| Setting | Options | Default |
|---------|---------|---------|
| Theme | System, Light, Dark | System |
| Accent Color | Preset palette + custom hex | #6366f1 |
| Font | System Default, Inter, JetBrains Mono, IBM Plex Sans | Inter |
| Density | Compact, Default, Relaxed | Default |
| Sidebar Width | 280px -- 500px slider | 360px |

All settings are persisted in IndexedDB and apply immediately.

---

## Troubleshooting

### The extension does not appear in Chrome

- Confirm you navigated to `chrome://extensions` (not `chrome://settings`).
- Confirm Developer mode is enabled.
- Confirm you selected the `.output/chrome-mv3-dev` folder, not the project root.
- If you previously loaded the extension, try clicking the refresh icon on the extension card.

### Context menu "Save to MTP Workbench" does not appear

- The context menu item only appears when you have text selected on a page.
- If you just installed or reloaded the extension, refresh the AI platform page first.
- Check `chrome://extensions` for any error indicators on the MTP Workbench card.

### The sidebar does not open

- MTP Workbench uses the Chrome Side Panel API. Make sure you are on Chrome 114 or later.
- If another extension's side panel is open, close it first -- Chrome only shows one side panel at a time.

### Changes during development are not reflected

- The dev server uses HMR for the sidebar and popup. Content script changes may require refreshing the target page.
- If the extension itself seems stale, go to `chrome://extensions` and click the refresh icon on the MTP Workbench card.
- Check the terminal running `npm run dev` for build errors.

### IndexedDB data is missing after reinstall

- Uninstalling and reinstalling the extension clears its IndexedDB storage. This is a Chrome behavior, not specific to MTP Workbench.
- During development, prefer reloading over uninstalling to preserve data.

### Type checking errors

Run the type checker:

```bash
npm run check
```

This invokes `svelte-check` against the TypeScript configuration and reports any issues.
