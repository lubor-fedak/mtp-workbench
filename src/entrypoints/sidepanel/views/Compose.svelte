<script lang="ts">
  import { ArrowLeft, Copy, Check } from 'lucide-svelte';
  import type {
    Project,
    ContextSnippet,
    MethodologyPackage,
    Platform,
    MessageResponse,
  } from '../../../shared/types';
  import { composePrompt, estimateTokens, checkContextLimit } from '../../../shared/prompt-engine';
  import PlatformSelector from '../components/PlatformSelector.svelte';

  interface Props {
    projectId: string | null;
    onBack: () => void;
  }

  let { projectId, onBack }: Props = $props();

  let project: Project | null = $state(null);
  let snippets: ContextSnippet[] = $state([]);
  let packages: MethodologyPackage[] = $state([]);
  let loading: boolean = $state(true);
  let copied: boolean = $state(false);

  // Selection state
  let selectedSnippetIds: Set<string> = $state(new Set());
  let selectedPackageIds: Set<string> = $state(new Set());
  let instruction: string = $state('');
  let targetPlatform: Platform = $state('claude');

  // Derived preview
  let selectedSnippets = $derived(
    snippets.filter((s) => selectedSnippetIds.has(s.id)),
  );
  let selectedPackages = $derived(
    packages.filter((p) => selectedPackageIds.has(p.id)),
  );

  let composedPrompt = $derived(
    project
      ? composePrompt({
          project_name: project.name,
          snippets: selectedSnippets,
          packages: selectedPackages,
          dead_ends: [],
          instruction: instruction || undefined,
          target_platform: targetPlatform,
        })
      : '',
  );

  let tokenCount = $derived(estimateTokens(composedPrompt));
  let withinLimit = $derived(checkContextLimit(composedPrompt, targetPlatform));

  $effect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      loading = false;
    }
  });

  function loadProjectData(id: string) {
    loading = true;
    let pending = 3;

    function checkDone() {
      pending--;
      if (pending <= 0) loading = false;
    }

    chrome.runtime.sendMessage(
      { type: 'GET_PROJECTS' },
      (response: MessageResponse<Project[]>) => {
        if (response?.success && response.data) {
          project = response.data.find((p) => p.id === id) ?? null;
        }
        checkDone();
      },
    );

    chrome.runtime.sendMessage(
      { type: 'GET_SNIPPETS', payload: { project_id: id } },
      (response: MessageResponse<ContextSnippet[]>) => {
        if (response?.success && response.data) {
          snippets = response.data;
        }
        checkDone();
      },
    );

    chrome.runtime.sendMessage(
      { type: 'GET_PACKAGES', payload: { project_id: id } },
      (response: MessageResponse<MethodologyPackage[]>) => {
        if (response?.success && response.data) {
          packages = response.data;
        }
        checkDone();
      },
    );
  }

  function toggleSnippet(id: string) {
    const next = new Set(selectedSnippetIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectedSnippetIds = next;
  }

  function togglePackage(id: string) {
    const next = new Set(selectedPackageIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectedPackageIds = next;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(composedPrompt);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = composedPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    }
  }
</script>

<div class="compose-view">
  <div class="compose-header">
    <button class="btn-icon" onclick={onBack} aria-label="Back">
      <ArrowLeft size={18} />
    </button>
    <h2 class="compose-title">Compose Prompt</h2>
  </div>

  {#if loading}
    <div class="loading-state">
      <p>Loading project data...</p>
    </div>
  {:else if !project}
    <div class="error-state">
      <p>No project selected. Go back and select a project first.</p>
    </div>
  {:else}
    <div class="compose-body">
      <!-- Project name -->
      <div class="compose-project">
        {project.name}
      </div>

      <!-- Context snippets selection -->
      {#if snippets.length > 0}
        <div class="selection-section">
          <h3 class="section-label">Context Snippets</h3>
          {#each snippets as snippet (snippet.id)}
            <label class="selection-item">
              <input
                type="checkbox"
                checked={selectedSnippetIds.has(snippet.id)}
                onchange={() => toggleSnippet(snippet.id)}
              />
              <span class="selection-text">{snippet.title}</span>
              <span class="selection-meta">{snippet.source_platform}</span>
            </label>
          {/each}
        </div>
      {/if}

      <!-- Packages selection -->
      {#if packages.length > 0}
        <div class="selection-section">
          <h3 class="section-label">Methodology Packages</h3>
          {#each packages as pkg (pkg.id)}
            <label class="selection-item">
              <input
                type="checkbox"
                checked={selectedPackageIds.has(pkg.id)}
                onchange={() => togglePackage(pkg.id)}
              />
              <span class="selection-text">{pkg.display_name}</span>
              <span class="selection-meta">{pkg.step_count} steps</span>
            </label>
          {/each}
        </div>
      {/if}

      {#if snippets.length === 0 && packages.length === 0}
        <p class="empty-note">
          This project has no snippets or packages. Add content to the project first.
        </p>
      {/if}

      <!-- Instruction -->
      <div class="form-group">
        <label class="section-label" for="instruction">Instruction</label>
        <textarea
          id="instruction"
          class="form-textarea"
          bind:value={instruction}
          placeholder="Add specific instructions for this execution..."
          rows="3"
        ></textarea>
      </div>

      <!-- Target platform -->
      <div class="form-group">
        <span class="section-label">Target Platform</span>
        <PlatformSelector
          value={targetPlatform}
          onChange={(p) => { targetPlatform = p; }}
        />
      </div>

      <!-- Token info -->
      <div class="token-info" class:over-limit={!withinLimit}>
        <span>~{tokenCount.toLocaleString()} tokens</span>
        {#if !withinLimit}
          <span class="limit-warning">Exceeds recommended context limit for {targetPlatform}</span>
        {/if}
      </div>

      <!-- Preview -->
      {#if composedPrompt}
        <div class="preview-section">
          <h3 class="section-label">Preview</h3>
          <div class="preview-box">
            <pre class="preview-text">{composedPrompt}</pre>
          </div>
        </div>
      {/if}

      <!-- Actions -->
      <div class="compose-actions">
        <button
          class="btn-primary btn-copy"
          onclick={copyToClipboard}
          disabled={!composedPrompt}
        >
          {#if copied}
            <Check size={16} />
            Copied
          {:else}
            <Copy size={16} />
            Copy to Clipboard
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .compose-view {
    padding: var(--mtp-spacing);
  }

  .compose-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--mtp-spacing);
  }

  .compose-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--mtp-text);
    margin: 0;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    color: var(--mtp-text);
    cursor: pointer;
    flex-shrink: 0;
  }

  .btn-icon:hover {
    background: var(--mtp-surface-hover);
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: var(--mtp-radius);
    background: var(--mtp-accent);
    color: #ffffff;
    font-family: var(--mtp-font);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .loading-state,
  .error-state {
    display: flex;
    justify-content: center;
    padding: 48px 24px;
    color: var(--mtp-text-secondary);
    text-align: center;
  }

  .compose-body {
    display: flex;
    flex-direction: column;
    gap: var(--mtp-spacing);
  }

  .compose-project {
    font-size: 14px;
    font-weight: 600;
    color: var(--mtp-accent);
    padding: 8px 12px;
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    border: 1px solid var(--mtp-border);
  }

  .selection-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .section-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--mtp-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 4px;
  }

  .selection-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: var(--mtp-radius);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .selection-item:hover {
    background: var(--mtp-surface);
  }

  .selection-item input[type="checkbox"] {
    accent-color: var(--mtp-accent);
  }

  .selection-text {
    flex: 1;
    font-size: 13px;
    color: var(--mtp-text);
  }

  .selection-meta {
    font-size: 11px;
    color: var(--mtp-text-secondary);
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mtp-surface);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-textarea {
    padding: 8px 10px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-bg);
    color: var(--mtp-text);
    font-family: var(--mtp-font);
    font-size: 14px;
    resize: vertical;
  }

  .form-textarea:focus {
    outline: none;
    border-color: var(--mtp-accent);
  }

  .empty-note {
    font-size: 13px;
    color: var(--mtp-text-secondary);
    text-align: center;
    padding: 16px;
  }

  .token-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--mtp-text-secondary);
  }

  .token-info.over-limit {
    color: #ef4444;
  }

  .limit-warning {
    font-weight: 600;
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .preview-box {
    padding: 12px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    max-height: 300px;
    overflow-y: auto;
  }

  .preview-text {
    font-size: 12px;
    color: var(--mtp-text);
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: var(--mtp-font);
    margin: 0;
    line-height: 1.5;
  }

  .compose-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--mtp-spacing);
    border-top: 1px solid var(--mtp-border);
  }

  .btn-copy {
    min-width: 160px;
    justify-content: center;
  }
</style>
