# MTP Workbench -- Chrome Web Store Listing

All text needed for the Chrome Web Store developer dashboard submission.

---

## 1. Extension Name

MTP Workbench

---

## 2. Short Description

(max 132 characters)

> Local methodology workspace for transferring AI-developed methodologies between Claude, ChatGPT, Gemini, and Copilot.

Character count: 115

---

## 3. Detailed Description

(max ~16,000 characters)

```
MTP Workbench is a local methodology workspace that lives in your browser sidebar. It helps you develop structured methodologies in one AI platform and reliably transfer them to another -- then measure how much was lost in translation.

This is not a prompt manager. It is a methodology workspace with execution tracking and drift measurement.


THE PROBLEM

If you work with multiple AI platforms, you have experienced this: you spend hours developing a refined, validated methodology in one AI (say Claude or ChatGPT Pro), complete with edge cases, dead ends, and precise step sequences. Then you need to apply that same methodology in a different AI that has access to your actual data -- perhaps Copilot connected to your enterprise environment, or ChatGPT with file uploads.

You copy and paste. You lose structure. The receiving AI interprets things differently. Steps get skipped. Edge cases are forgotten. Dead ends you carefully documented are ignored, and the AI walks right into them again.

There is no way to know how much of your methodology survived the transfer. No way to track whether results are degrading over time. No systematic approach to cross-platform methodology reuse.

MTP Workbench solves this.


HOW IT WORKS

MTP Workbench organizes your AI work into Projects -- structured workspaces that contain everything related to a methodology domain:

- Context Snippets: definitions, rules, thresholds, and domain knowledge you have collected from AI conversations
- Methodology Packages: structured step-by-step methodologies extracted from AI conversations, displayed as visual cards (not code or markup)
- Execution Records: historical results showing when, where, and how well a methodology was applied
- Dead Ends: documented approaches that failed -- critical knowledge that prevents repeating mistakes

From any project, you compose prompts by selecting the context and methodology components you need, adding task-specific instructions, and choosing your target platform. The extension generates a platform-aware prompt that preserves the full structure of your methodology.

After the target AI executes the methodology, you capture the result. MTP Workbench calculates a drift score -- a quantitative measure of how faithfully the methodology was preserved -- broken down into seven components including step fidelity, deviation rate, validation pass rate, output quality, edge case coverage, novel situation handling, and dead end avoidance.

Over time, the Drift Dashboard shows you trends: which methodologies transfer well to which platforms, where degradation occurs, and how your cross-platform methodology reuse is improving.


KEY FEATURES

Projects and Organization
- Create projects with custom icons (1500+ from the Lucide library), accent colors, and descriptions
- Tag and search across all your projects and snippets
- Quick Chats for one-off captures without creating a full project
- Drag and drop content between projects

Context Capture
- Right-click any selected text on a supported AI platform to save it to MTP Workbench
- Extract full methodology packages from AI conversations
- Auto-tagging with source platform, timestamp, and topic
- All captured content stays entirely in your browser

Prompt Composition
- Select context snippets and methodology packages via checkboxes
- Add task-specific instruction layers
- Platform-aware prompt generation that adapts to target AI capabilities
- Preview the composed prompt before sending
- Copy to clipboard or inject directly into the active AI tab

Drift Measurement
- Quantitative drift scoring (0-100%) for every methodology execution
- Seven-component drift breakdown for detailed analysis
- Six execution states: success, partial, deviation, failure, skipped, escalated
- Cross-platform comparison: see how the same methodology performs on different AIs
- Historical trends and visual gauges

Theming and Customization
- Light, dark, and system-following themes with smooth transitions
- Configurable accent color for the entire interface
- Three bundled font families: Inter (clean, modern), JetBrains Mono (technical), IBM Plex Sans (enterprise)
- Density settings: compact, default, or relaxed spacing
- Adjustable sidebar width


SUPPORTED AI PLATFORMS

- Claude (claude.ai)
- ChatGPT (chatgpt.com)
- Google Gemini (gemini.google.com)
- Microsoft Copilot (copilot.microsoft.com)

Adding new platforms requires only a new content script -- the core architecture is fully pluggable.


PRIVACY AND DATA

MTP Workbench is built on a zero-backend, privacy-first architecture:

- No data ever leaves your browser. All storage uses IndexedDB, local to your machine.
- No user accounts, no registration, no sign-in.
- No cloud sync, no telemetry, no analytics.
- No external network requests of any kind. Even fonts are bundled in the extension -- no CDN calls, no Google Fonts.
- Fully open source (Apache 2.0 license) for complete auditability.

Your methodologies, your data, your browser. Nothing else.


BASED ON AN OPEN SPECIFICATION

MTP Workbench is the product layer over the Methodology Transfer Protocol (MTP), an open specification for encoding, transferring, and measuring AI-developed methodologies. The MTP specification defines structured methodology packages with steps, edge cases, dead ends, validation criteria, and a formal drift measurement framework.

The specification is developed and maintained separately at:
https://github.com/luborfedak/mtp-spec

MTP Workbench makes the protocol invisible to users -- you work with visual cards, checkboxes, and gauges, never with YAML or schemas. The protocol handles the structure under the hood.


WHO THIS IS FOR

- AI practitioners who develop methodologies in one platform and apply them in another
- Enterprise teams using commercial AI for methodology development and corporate AI for data access
- Analysts, data scientists, and consultants who need reproducible AI workflows
- Anyone who wants to measure whether their AI-developed approaches actually survive cross-platform transfer


OPEN SOURCE

MTP Workbench is free and open source under the Apache 2.0 license.

Source code: https://github.com/luborfedak/mtp-workbench
MTP Specification: https://github.com/luborfedak/mtp-spec

Created by Lubor Fedak, AI Evangelist and Business Leader for Europe at Kyndryl.
```

---

## 4. Category

Productivity

---

## 5. Language

English

---

## 6. Privacy Practices Text

```
MTP Workbench does not collect, transmit, or share any user data.

- No data collection: The extension does not collect any personal information, browsing history, or usage data.
- No user authentication: There are no user accounts, no sign-in, and no registration of any kind.
- All data stored locally: All user data (projects, snippets, methodology packages, execution records) is stored exclusively in the browser's IndexedDB. Nothing is sent to any server.
- No external network requests: The extension makes zero network requests. It does not contact any external servers, APIs, or CDNs.
- Fonts bundled locally: All font files (Inter, JetBrains Mono, IBM Plex Sans) are bundled within the extension package. No requests to Google Fonts or any other font CDN.
- Open source: The full source code is available under the Apache 2.0 license at https://github.com/luborfedak/mtp-workbench for independent verification of all privacy claims.
```

---

## 7. Single Purpose Description

(required by Chrome Web Store)

```
A methodology workspace that helps users organize, compose, and transfer AI-developed methodologies across different AI platforms.
```

---

## 8. Permissions Justification

(required by Chrome Web Store for each requested permission)

| Permission | Justification |
|-----------|--------------|
| `sidePanel` | The extension's main workspace UI is displayed as a persistent side panel alongside AI platform tabs, allowing users to view and manage their projects, compose prompts, and review drift scores without leaving the AI conversation. |
| `activeTab` | Required for two core functions: (1) reading user-selected text from the active AI platform tab to capture context snippets and methodology content, and (2) injecting composed prompts into the active AI platform tab's input field. |
| `contextMenus` | Provides a right-click "Save to MTP Workbench" context menu entry on supported AI platforms, enabling users to quickly capture selected text as context snippets or methodology content. |
| `storage` | Used to store user theme preferences (light/dark mode, accent color, font choice, density setting) via chrome.storage.local, allowing these preferences to be shared across the extension's different contexts (sidebar, popup, content scripts). |
| Host permission: `*://claude.ai/*` | Content script injection on claude.ai to enable text selection capture and composed prompt injection within Claude conversations. |
| Host permission: `*://chatgpt.com/*` | Content script injection on chatgpt.com to enable text selection capture and composed prompt injection within ChatGPT conversations. |
| Host permission: `*://gemini.google.com/*` | Content script injection on gemini.google.com to enable text selection capture and composed prompt injection within Gemini conversations. |
| Host permission: `*://copilot.microsoft.com/*` | Content script injection on copilot.microsoft.com to enable text selection capture and composed prompt injection within Copilot conversations. |

---

## 9. Privacy Policy URL

```
https://github.com/luborfedak/mtp-workbench/blob/main/docs/PRIVACY-POLICY.md
```

---

## 10. Additional Store Assets (Checklist)

The following visual assets are required for the Chrome Web Store listing but are not included in this document. Prepare them separately:

- [ ] Extension icon: 128x128 PNG
- [ ] Promotional tile (small): 440x280 PNG
- [ ] Promotional tile (large): 920x680 PNG (optional but recommended)
- [ ] Screenshots: 1280x800 or 640x400, minimum 1, maximum 5
  - Suggested screenshots: Projects view, Compose view, Drift Dashboard, Context capture, Theme settings
