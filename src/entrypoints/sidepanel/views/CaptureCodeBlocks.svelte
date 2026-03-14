<script lang="ts">
  import { Save, X, Check, FileCode } from 'lucide-svelte';
  import { v4 as uuidv4 } from 'uuid';
  import type {
    Project,
    CodeBlock,
    ContextSnippet,
    Platform,
    MessageResponse,
  } from '../../../shared/types';

  interface Props {
    blocks: CodeBlock[];
    sourceUrl: string;
    onSaved: () => void;
    onCancel: () => void;
  }

  let { blocks, sourceUrl, onSaved, onCancel }: Props = $props();

  let projects: Project[] = $state([]);
  let selectedProjectId: string = $state('');
  let selectedBlocks: Set<number> = $state(new Set());
  let saving: boolean = $state(false);
  let loading: boolean = $state(true);
  let savedCount: number = $state(0);

  // Derive source platform from URL
  let sourcePlatform: Platform = $derived(detectPlatformFromUrl(sourceUrl));

  // Select all blocks by default
  $effect(() => {
    if (blocks.length > 0) {
      selectedBlocks = new Set(blocks.map((_, i) => i));
    }
  });

  $effect(() => {
    chrome.runtime.sendMessage(
      { type: 'GET_PROJECTS' },
      (response: MessageResponse<Project[]>) => {
        loading = false;
        if (response?.success && response.data) {
          projects = response.data;
          if (projects.length > 0) {
            selectedProjectId = projects[0].id;
          }
        }
      },
    );
  });

  function detectPlatformFromUrl(url: string): Platform {
    if (!url) return 'other';
    if (url.includes('claude.ai')) return 'claude';
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'chatgpt';
    if (url.includes('gemini.google.com')) return 'gemini';
    if (url.includes('copilot.microsoft.com') || url.includes('copilot.cloud.microsoft')) return 'copilot';
    return 'other';
  }

  function toggleBlock(index: number) {
    const next = new Set(selectedBlocks);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    selectedBlocks = next;
  }

  function toggleAll() {
    if (selectedBlocks.size === blocks.length) {
      selectedBlocks = new Set();
    } else {
      selectedBlocks = new Set(blocks.map((_, i) => i));
    }
  }

  function blockTitle(block: CodeBlock, index: number): string {
    if (block.filename) return block.filename;
    if (block.language) return `${block.language} snippet #${index + 1}`;
    return `Code snippet #${index + 1}`;
  }

  function handleSave() {
    if (!selectedProjectId || selectedBlocks.size === 0) return;

    saving = true;
    savedCount = 0;

    const selected = blocks.filter((_, i) => selectedBlocks.has(i));
    let pending = selected.length;

    selected.forEach((block, i) => {
      const snippet: ContextSnippet = {
        id: uuidv4(),
        project_id: selectedProjectId,
        title: blockTitle(block, i),
        content: block.code,
        content_type: 'code',
        language: block.language || undefined,
        filename: block.filename || undefined,
        source_platform: sourcePlatform,
        source_url: sourceUrl || undefined,
        tags: block.language ? [block.language] : [],
        created_at: new Date().toISOString(),
      };

      chrome.runtime.sendMessage(
        { type: 'CREATE_SNIPPET', payload: snippet },
        (response: MessageResponse<ContextSnippet>) => {
          pending--;
          if (response?.success) {
            savedCount++;
          }
          if (pending === 0) {
            saving = false;
            if (savedCount > 0) {
              onSaved();
            }
          }
        },
      );
    });
  }
</script>

<div class="capture-view">
  <div class="capture-header">
    <h2 class="capture-title">
      <FileCode size={18} />
      Capture Code Blocks
    </h2>
    <button class="btn-icon" onclick={onCancel} aria-label="Cancel">
      <X size={18} />
    </button>
  </div>

  {#if sourceUrl}
    <div class="source-info">
      <span class="source-platform">{sourcePlatform}</span>
      <span class="source-url" title={sourceUrl}>
        {sourceUrl.length > 40 ? sourceUrl.slice(0, 40) + '...' : sourceUrl}
      </span>
    </div>
  {/if}

  {#if blocks.length === 0}
    <p class="empty-text">No code blocks found on this page.</p>
  {:else}
    <div class="capture-form">
      <!-- Project selector -->
      <div class="form-group">
        <label class="form-label" for="capture-project">Project</label>
        {#if loading}
          <p class="loading-text">Loading projects...</p>
        {:else if projects.length === 0}
          <p class="warning-text">No projects available. Create a project first.</p>
        {:else}
          <select
            id="capture-project"
            class="form-select"
            bind:value={selectedProjectId}
          >
            {#each projects as proj (proj.id)}
              <option value={proj.id}>{proj.name}</option>
            {/each}
          </select>
        {/if}
      </div>

      <!-- Select all toggle -->
      <div class="select-all">
        <button class="btn-ghost" onclick={toggleAll}>
          {selectedBlocks.size === blocks.length ? 'Deselect All' : 'Select All'}
        </button>
        <span class="selection-count">{selectedBlocks.size} / {blocks.length} selected</span>
      </div>

      <!-- Code block list -->
      <div class="block-list">
        {#each blocks as block, i (i)}
          <div
            class="block-item"
            class:selected={selectedBlocks.has(i)}
            onclick={() => toggleBlock(i)}
            role="checkbox"
            aria-checked={selectedBlocks.has(i)}
            tabindex="0"
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleBlock(i); }}
          >
            <div class="block-check">
              {#if selectedBlocks.has(i)}
                <Check size={14} />
              {/if}
            </div>
            <div class="block-info">
              <div class="block-name">{blockTitle(block, i)}</div>
              {#if block.language}
                <span class="lang-badge">{block.language}</span>
              {/if}
            </div>
            <div class="block-preview">{block.code.slice(0, 80)}{block.code.length > 80 ? '...' : ''}</div>
          </div>
        {/each}
      </div>

      <!-- Actions -->
      <div class="capture-actions">
        <button class="btn-secondary" onclick={onCancel}>Cancel</button>
        <button
          class="btn-primary"
          onclick={handleSave}
          disabled={saving || !selectedProjectId || selectedBlocks.size === 0}
        >
          <Save size={14} />
          {saving ? 'Saving...' : `Save ${selectedBlocks.size} snippet${selectedBlocks.size !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .capture-view {
    padding: var(--mtp-spacing);
  }

  .capture-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--mtp-spacing);
  }

  .capture-title {
    display: flex;
    align-items: center;
    gap: 6px;
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
  }

  .btn-icon:hover {
    background: var(--mtp-surface-hover);
  }

  .source-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    border: 1px solid var(--mtp-border);
    margin-bottom: var(--mtp-spacing);
  }

  .source-platform {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--mtp-accent);
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--mtp-bg);
  }

  .source-url {
    font-size: 12px;
    color: var(--mtp-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-text {
    color: var(--mtp-text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 24px;
  }

  .capture-form {
    display: flex;
    flex-direction: column;
    gap: var(--mtp-spacing);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--mtp-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-select {
    padding: 8px 10px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-bg);
    color: var(--mtp-text);
    font-family: var(--mtp-font);
    font-size: 14px;
  }

  .loading-text {
    font-size: 13px;
    color: var(--mtp-text-secondary);
    margin: 0;
  }

  .warning-text {
    font-size: 13px;
    color: #f59e0b;
    margin: 0;
  }

  .select-all {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .btn-ghost {
    padding: 4px 10px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: transparent;
    color: var(--mtp-accent);
    font-family: var(--mtp-font);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-ghost:hover {
    background: var(--mtp-surface);
  }

  .selection-count {
    font-size: 12px;
    color: var(--mtp-text-tertiary);
  }

  .block-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 400px;
    overflow-y: auto;
  }

  .block-item {
    display: grid;
    grid-template-columns: 24px 1fr;
    grid-template-rows: auto auto;
    gap: 4px 8px;
    padding: 10px 12px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    cursor: pointer;
    transition: border-color 0.15s ease;
  }

  .block-item:hover {
    border-color: var(--mtp-accent);
  }

  .block-item.selected {
    border-color: var(--mtp-accent);
    background: color-mix(in srgb, var(--mtp-accent) 5%, var(--mtp-surface));
  }

  .block-check {
    grid-row: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 2px solid var(--mtp-border);
    border-radius: 4px;
    color: var(--mtp-accent);
    align-self: center;
  }

  .block-item.selected .block-check {
    border-color: var(--mtp-accent);
    background: var(--mtp-accent);
    color: #fff;
  }

  .block-info {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .block-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--mtp-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lang-badge {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mtp-bg);
    color: var(--mtp-accent);
    letter-spacing: 0.3px;
  }

  .block-preview {
    grid-column: 2;
    font-size: 11px;
    font-family: var(--mtp-font-mono, 'JetBrains Mono', monospace);
    color: var(--mtp-text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .capture-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: var(--mtp-spacing);
    border-top: 1px solid var(--mtp-border);
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

  .btn-secondary {
    padding: 8px 16px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    color: var(--mtp-text);
    font-family: var(--mtp-font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-secondary:hover { background: var(--mtp-surface-hover); }
</style>
