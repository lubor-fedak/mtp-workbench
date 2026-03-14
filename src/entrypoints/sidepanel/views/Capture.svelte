<script lang="ts">
  import { Save, X } from 'lucide-svelte';
  import { v4 as uuidv4 } from 'uuid';
  import type {
    Project,
    ContextSnippet,
    Platform,
    MessageResponse,
  } from '../../../shared/types';

  interface Props {
    text: string;
    sourceUrl: string;
    onSaved: () => void;
    onCancel: () => void;
  }

  let { text, sourceUrl, onSaved, onCancel }: Props = $props();

  let projects: Project[] = $state([]);
  let selectedProjectId: string = $state('');
  let title: string = $state('');
  let content: string = $state('');
  let saving: boolean = $state(false);
  let loading: boolean = $state(true);

  // Sync content when text prop changes
  $effect(() => {
    content = text;
  });

  // Derive source platform from URL
  let sourcePlatform: Platform = $derived(
    detectPlatformFromUrl(sourceUrl),
  );

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

  // Auto-generate title from first line of text
  $effect(() => {
    if (!title && text) {
      const firstLine = text.split('\n')[0].trim();
      title = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;
    }
  });

  function detectPlatformFromUrl(url: string): Platform {
    if (!url) return 'other';
    if (url.includes('claude.ai')) return 'claude';
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'chatgpt';
    if (url.includes('gemini.google.com')) return 'gemini';
    if (url.includes('copilot.microsoft.com') || url.includes('copilot.cloud.microsoft')) return 'copilot';
    return 'other';
  }

  function handleSave() {
    if (!selectedProjectId || !title.trim() || !content.trim()) return;

    saving = true;

    const snippet: ContextSnippet = {
      id: uuidv4(),
      project_id: selectedProjectId,
      title: title.trim(),
      content: content.trim(),
      content_type: 'text',
      source_platform: sourcePlatform,
      source_url: sourceUrl || undefined,
      tags: [],
      created_at: new Date().toISOString(),
    };

    chrome.runtime.sendMessage(
      { type: 'CREATE_SNIPPET', payload: snippet },
      (response: MessageResponse<ContextSnippet>) => {
        saving = false;
        if (response?.success) {
          onSaved();
        }
      },
    );
  }
</script>

<div class="capture-view">
  <div class="capture-header">
    <h2 class="capture-title">Save Captured Text</h2>
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

    <!-- Title -->
    <div class="form-group">
      <label class="form-label" for="capture-title">Title</label>
      <input
        id="capture-title"
        class="form-input"
        type="text"
        bind:value={title}
        placeholder="Snippet title"
      />
    </div>

    <!-- Content preview/edit -->
    <div class="form-group">
      <label class="form-label" for="capture-content">Content</label>
      <textarea
        id="capture-content"
        class="form-textarea"
        bind:value={content}
        rows="10"
      ></textarea>
    </div>

    <!-- Actions -->
    <div class="capture-actions">
      <button class="btn-secondary" onclick={onCancel}>Cancel</button>
      <button
        class="btn-primary"
        onclick={handleSave}
        disabled={saving || !selectedProjectId || !title.trim() || !content.trim()}
      >
        <Save size={14} />
        {saving ? 'Saving...' : 'Save Snippet'}
      </button>
    </div>
  </div>
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

  .form-input {
    padding: 8px 10px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-bg);
    color: var(--mtp-text);
    font-family: var(--mtp-font);
    font-size: 14px;
  }

  .form-input:focus {
    outline: none;
    border-color: var(--mtp-accent);
  }

  .form-textarea {
    padding: 8px 10px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-bg);
    color: var(--mtp-text);
    font-family: var(--mtp-font);
    font-size: 13px;
    resize: vertical;
    line-height: 1.5;
  }

  .form-textarea:focus {
    outline: none;
    border-color: var(--mtp-accent);
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
