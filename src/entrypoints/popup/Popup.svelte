<script lang="ts">
  import { FolderOpen, Wand2, BookOpen, ExternalLink } from 'lucide-svelte';

  async function openSidePanel() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.sidePanel.open({ tabId: tab.id });
    }
    window.close();
  }

  async function captureSelection() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_SELECTION' }, (response) => {
      if (response?.success && response.data?.text) {
        chrome.runtime.sendMessage({
          type: 'CAPTURE_SELECTION',
          payload: {
            text: response.data.text,
            url: response.data.url,
            tabId: tab.id,
          },
        });
        chrome.sidePanel.open({ tabId: tab.id! });
        window.close();
      }
    });
  }

  let projectCount = $state(0);

  $effect(() => {
    chrome.runtime.sendMessage({ type: 'GET_PROJECTS' }, (response) => {
      if (response?.success) {
        projectCount = response.data?.length ?? 0;
      }
    });
  });
</script>

<div class="popup">
  <div class="popup-header">
    <h1>MTP Workbench</h1>
  </div>

  <div class="popup-actions">
    <button class="popup-action" onclick={captureSelection}>
      <BookOpen size={18} />
      <div class="action-text">
        <span class="action-title">Capture Selection</span>
        <span class="action-desc">Save selected text to a project</span>
      </div>
    </button>

    <button class="popup-action" onclick={openSidePanel}>
      <FolderOpen size={18} />
      <div class="action-text">
        <span class="action-title">Open Workbench</span>
        <span class="action-desc">{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
      </div>
    </button>

    <button class="popup-action" onclick={openSidePanel}>
      <Wand2 size={18} />
      <div class="action-text">
        <span class="action-title">Compose Prompt</span>
        <span class="action-desc">Build context-aware prompt</span>
      </div>
    </button>
  </div>

  <div class="popup-footer">
    <span>v0.1.0</span>
    <a href="https://github.com/luborfedak/mtp-spec" target="_blank" rel="noopener">
      MTP Spec <ExternalLink size={12} />
    </a>
  </div>
</div>

<style>
  .popup {
    width: 300px;
    font-family: var(--mtp-font);
  }

  .popup-header {
    padding: 16px;
    border-bottom: 1px solid var(--mtp-border);
  }

  .popup-header h1 {
    font-size: 16px;
    font-weight: 700;
    color: var(--mtp-text);
  }

  .popup-actions {
    padding: 8px;
  }

  .popup-action {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: var(--mtp-radius);
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: var(--mtp-text);
    transition: background 0.15s ease;
  }

  .popup-action:hover {
    background: var(--mtp-surface-hover);
  }

  .popup-action :global(svg) {
    color: var(--mtp-accent);
    flex-shrink: 0;
  }

  .action-text {
    display: flex;
    flex-direction: column;
  }

  .action-title {
    font-size: 14px;
    font-weight: 500;
  }

  .action-desc {
    font-size: 12px;
    color: var(--mtp-text-secondary);
  }

  .popup-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-top: 1px solid var(--mtp-border);
    font-size: 11px;
    color: var(--mtp-text-tertiary);
  }

  .popup-footer a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--mtp-accent);
    text-decoration: none;
  }

  .popup-footer a:hover {
    text-decoration: underline;
  }
</style>
