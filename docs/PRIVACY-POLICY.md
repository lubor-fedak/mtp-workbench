# Privacy Policy — MTP Workbench

**Last updated:** March 10, 2026

MTP Workbench is a browser extension that provides a local methodology workspace for working with AI platforms. It is developed by Lubor Fedak and published as open-source software under the Apache 2.0 license.

Source code: [https://github.com/lubor-fedak/mtp-workbench](https://github.com/lubor-fedak/mtp-workbench)

---

## Summary

MTP Workbench does not collect, transmit, or share any user data. All data remains on your device, under your control.

---

## Data Collection

MTP Workbench does **not** collect any personal information or usage data. Specifically:

- No personal identifiers (name, email, address, phone number)
- No browsing history or activity tracking
- No analytics, telemetry, or crash reports
- No keystroke logging or form data capture
- No location data
- No device fingerprinting

## Data Storage

All data created and managed by MTP Workbench is stored **locally on your device** using the following browser-native mechanisms:

- **IndexedDB** — used for storing methodology packages, reports, and workspace data
- **chrome.storage.local** — used exclusively for theme preferences (light/dark mode)

No data is stored on external servers. There is no cloud synchronization, no remote database, and no backend infrastructure of any kind.

## Network Requests

MTP Workbench makes **zero external network requests**. The extension:

- Does not contact any remote server or API
- Does not load external resources (fonts, scripts, stylesheets, or images)
- Does not use any content delivery network (CDN)
- Bundles all required assets (fonts, icons) within the extension package itself

## Content Scripts

MTP Workbench uses content scripts that operate on the following AI platform websites:

- claude.ai
- chatgpt.com
- gemini.google.com
- copilot.microsoft.com

These content scripts enable two functions:

1. **Text selection capture** — allows you to select text on these sites and save it to your local workspace
2. **Prompt injection** — allows you to insert methodology prompts into the platform's input fields

Content scripts perform DOM interaction only. They do not read, extract, or transmit page content beyond what you explicitly select. All captured data is stored locally on your device and is never sent elsewhere.

## Data Sharing

MTP Workbench does **not** share any data with third parties. There is no data to share because no data leaves your browser.

## Third-Party Services

MTP Workbench does **not** integrate with or rely on any third-party services, including:

- No analytics platforms (Google Analytics, Mixpanel, etc.)
- No advertising networks
- No error reporting services (Sentry, Bugsnag, etc.)
- No social media integrations
- No payment processors

## Cookies

MTP Workbench does **not** use cookies of any kind. It does not set, read, or modify cookies on any website.

## User Accounts and Authentication

MTP Workbench requires **no registration**, no user accounts, and no authentication. There is no login process and no credentials to manage.

## Children's Privacy

MTP Workbench is not directed at children under the age of 13. The extension does not knowingly collect any personal information from anyone, including children.

## Data Deletion

Since all data is stored locally in your browser, you have full control over it at all times. You can delete all MTP Workbench data by:

- Clearing your browser's site data and IndexedDB storage
- Uninstalling the extension (which removes all associated local storage)

## Permissions

MTP Workbench requests only the minimum browser permissions necessary for its functionality:

- **activeTab / specific site permissions** — to enable content script interaction on supported AI platforms
- **storage** — to persist theme preferences locally
- **sidePanel** — to display the workspace sidebar

No permissions are used for data collection or tracking purposes.

## Open Source

MTP Workbench is open-source software. You can inspect the complete source code to verify these privacy claims at:

[https://github.com/lubor-fedak/mtp-workbench](https://github.com/lubor-fedak/mtp-workbench)

## Changes to This Policy

If this privacy policy is updated, the changes will be published in the extension's repository and reflected in updated versions of the extension. The "Last updated" date at the top of this document will be revised accordingly.

## Contact

For questions or concerns about this privacy policy, please contact:

**Lubor Fedak**
GitHub: [https://github.com/lubor-fedak](https://github.com/lubor-fedak)
