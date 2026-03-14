<script lang="ts">
  import { Plus, Download, Upload, Search, X } from 'lucide-svelte';
  import type { Project, MessageResponse, ProjectExport, BulkExport, ContextSnippet } from '../../../shared/types';
  import type { SearchResult } from '../../../lib/storage';
  import { getPlatformName } from '../../../shared/platforms';

  interface Props {
    onSelect: (id: string) => void;
    onCreate: () => void;
  }

  let { onSelect, onCreate }: Props = $props();

  let projects: Project[] = $state([]);
  let loading: boolean = $state(true);
  let error: string | null = $state(null);

  $effect(() => {
    loadProjects();
  });

  function loadProjects() {
    loading = true;
    error = null;
    chrome.runtime.sendMessage({ type: 'GET_PROJECTS' }, (response: MessageResponse<Project[]>) => {
      loading = false;
      if (response?.success && response.data) {
        projects = response.data;
      } else {
        error = response?.error ?? 'Failed to load projects';
      }
    });
  }

  let importing: boolean = $state(false);
  let fileInput: HTMLInputElement;

  // Search state
  let searchQuery: string = $state('');
  let searchResults: SearchResult[] = $state([]);
  let searching: boolean = $state(false);
  let searchTimeout: ReturnType<typeof setTimeout>;

  function handleSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    searchQuery = value;
    clearTimeout(searchTimeout);

    if (!value.trim()) {
      searchResults = [];
      searching = false;
      return;
    }

    searching = true;
    searchTimeout = setTimeout(() => {
      chrome.runtime.sendMessage(
        { type: 'SEARCH_SNIPPETS', payload: { query: value.trim() } },
        (response: MessageResponse<SearchResult[]>) => {
          searching = false;
          if (response?.success && response.data) {
            searchResults = response.data;
          }
        },
      );
    }, 250);
  }

  function clearSearch() {
    searchQuery = '';
    searchResults = [];
    searching = false;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function truncate(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  function handleExportAll() {
    chrome.runtime.sendMessage(
      { type: 'EXPORT_ALL_PROJECTS' },
      (response: MessageResponse<BulkExport>) => {
        if (response?.success && response.data) {
          const json = JSON.stringify(response.data, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `mtp-workbench-backup-${new Date().toISOString().slice(0, 10)}.mtp.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      },
    );
  }

  function handleImportClick() {
    fileInput?.click();
  }

  function handleFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    importing = true;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        chrome.runtime.sendMessage(
          { type: 'IMPORT_PROJECT', payload: data },
          (response: MessageResponse) => {
            importing = false;
            if (response?.success) {
              loadProjects();
            } else {
              error = response?.error ?? 'Import failed';
            }
            // Reset file input so same file can be re-imported
            input.value = '';
          },
        );
      } catch {
        importing = false;
        error = 'Invalid JSON file';
        input.value = '';
      }
    };
    reader.readAsText(file);
  }
</script>

<div class="projects-view">
  <input
    type="file"
    accept=".json,.mtp.json"
    style="display:none"
    bind:this={fileInput}
    onchange={handleFileSelected}
  />

  <div class="projects-header">
    <h2 class="projects-title">Projects</h2>
    <div class="header-actions">
      {#if projects.length > 0}
        <button class="btn-icon" onclick={handleExportAll} title="Export all projects">
          <Download size={16} />
        </button>
      {/if}
      <button class="btn-icon" onclick={handleImportClick} title="Import project" disabled={importing}>
        <Upload size={16} />
      </button>
      <button class="btn-primary" onclick={onCreate}>
        <Plus size={16} />
        New Project
      </button>
    </div>
  </div>

  <!-- Search bar -->
  <div class="search-bar">
    <Search size={14} class="search-icon" />
    <input
      type="text"
      class="search-input"
      placeholder="Search snippets..."
      value={searchQuery}
      oninput={handleSearchInput}
    />
    {#if searchQuery}
      <button class="search-clear" onclick={clearSearch} aria-label="Clear search">
        <X size={14} />
      </button>
    {/if}
  </div>

  <!-- Search results -->
  {#if searchQuery.trim()}
    <div class="search-results">
      {#if searching}
        <p class="search-status">Searching...</p>
      {:else if searchResults.length === 0}
        <p class="search-status">No results for "{searchQuery}"</p>
      {:else}
        <p class="search-status">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
        <div class="result-list">
          {#each searchResults as result (result.snippet.id)}
            <div class="result-card">
              <div class="result-header">
                <span class="result-project" style="color: {result.project_color}">{result.project_name}</span>
                <button
                  class="result-copy"
                  onclick={() => copyToClipboard(result.snippet.content)}
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
              <h4 class="result-title">{result.snippet.title}</h4>
              <p class="result-preview">
                {result.snippet.content.length > 120
                  ? result.snippet.content.slice(0, 120) + '...'
                  : result.snippet.content}
              </p>
              <div class="result-meta">
                {#if result.snippet.content_type === 'code' && result.snippet.language}
                  <span class="result-lang">{result.snippet.language}</span>
                {/if}
                <span class="result-platform">{getPlatformName(result.snippet.source_platform)}</span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if !searchQuery.trim() && loading}
    <div class="loading-state">
      <p>Loading projects...</p>
    </div>
  {:else if !searchQuery.trim() && error}
    <div class="error-state">
      <p>{error}</p>
      <button class="btn-secondary" onclick={loadProjects}>Retry</button>
    </div>
  {:else if !searchQuery.trim() && projects.length === 0}
    <div class="empty-state">
      <div class="empty-icon">
        <Plus size={32} />
      </div>
      <p class="empty-title">No projects yet</p>
      <p class="empty-description">Create your first project to start organizing methodologies and context.</p>
      <button class="btn-primary" onclick={onCreate}>
        <Plus size={16} />
        Create Project
      </button>
    </div>
  {:else if !searchQuery.trim()}
    <div class="project-list">
      {#each projects as project (project.id)}
        <button
          class="project-card"
          style="border-left-color: {project.appearance.color}"
          onclick={() => onSelect(project.id)}
        >
          <div class="project-card-icon" style="color: {project.appearance.color}">
            {#if project.appearance.icon_type === 'emoji'}
              <span class="project-emoji">{project.appearance.icon}</span>
            {:else}
              <span class="project-icon-name">{project.appearance.icon}</span>
            {/if}
          </div>
          <div class="project-card-body">
            <h3 class="project-name">{project.name}</h3>
            {#if project.description}
              <p class="project-description">{truncate(project.description, 80)}</p>
            {/if}
            {#if project.tags.length > 0}
              <div class="project-tags">
                {#each project.tags as tag}
                  <span class="tag-badge">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .projects-view {
    padding: var(--mtp-spacing);
  }

  .projects-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--mtp-spacing);
  }

  .projects-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--mtp-text);
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
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

  .btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
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

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-secondary {
    padding: 8px 14px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    color: var(--mtp-text);
    font-family: var(--mtp-font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: var(--mtp-surface-hover);
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 24px;
    color: var(--mtp-text-secondary);
    text-align: center;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 24px;
    text-align: center;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--mtp-surface);
    color: var(--mtp-text-secondary);
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--mtp-text);
    margin: 0;
  }

  .empty-description {
    font-size: 13px;
    color: var(--mtp-text-secondary);
    margin: 0;
    max-width: 260px;
    line-height: 1.5;
  }

  .project-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .project-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--mtp-border);
    border-left: 3px solid;
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    cursor: pointer;
    transition: background 0.15s ease;
    text-align: left;
    width: 100%;
    font-family: var(--mtp-font);
  }

  .project-card:hover {
    background: var(--mtp-surface-hover);
  }

  .project-card-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--mtp-radius);
    background: var(--mtp-bg);
    font-size: 18px;
  }

  .project-emoji {
    font-size: 20px;
    line-height: 1;
  }

  .project-icon-name {
    font-size: 11px;
    font-weight: 500;
    text-transform: lowercase;
    opacity: 0.8;
  }

  .project-card-body {
    flex: 1;
    min-width: 0;
  }

  .project-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--mtp-text);
    margin: 0 0 2px;
  }

  .project-description {
    font-size: 12px;
    color: var(--mtp-text-secondary);
    margin: 0 0 6px;
    line-height: 1.4;
  }

  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag-badge {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mtp-bg);
    color: var(--mtp-text-secondary);
    border: 1px solid var(--mtp-border);
  }

  /* Search */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    margin-bottom: var(--mtp-spacing);
  }

  .search-bar :global(.search-icon) {
    flex-shrink: 0;
    color: var(--mtp-text-tertiary);
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--mtp-text);
    font-family: var(--mtp-font);
    font-size: 13px;
    outline: none;
  }

  .search-input::placeholder {
    color: var(--mtp-text-tertiary);
  }

  .search-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--mtp-text-tertiary);
    cursor: pointer;
  }

  .search-clear:hover {
    background: var(--mtp-bg);
    color: var(--mtp-text);
  }

  .search-results {
    margin-bottom: var(--mtp-spacing);
  }

  .search-status {
    font-size: 12px;
    color: var(--mtp-text-tertiary);
    margin: 0 0 8px;
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .result-card {
    padding: 10px 12px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
  }

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .result-project {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .result-copy {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border: 1px solid var(--mtp-border);
    border-radius: 4px;
    background: transparent;
    color: var(--mtp-accent);
    cursor: pointer;
  }

  .result-copy:hover {
    background: var(--mtp-bg);
  }

  .result-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--mtp-text);
    margin: 0 0 4px;
  }

  .result-preview {
    font-size: 12px;
    color: var(--mtp-text-secondary);
    margin: 0 0 6px;
    line-height: 1.4;
  }

  .result-meta {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .result-lang {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mtp-bg);
    color: var(--mtp-accent);
  }

  .result-platform {
    font-size: 11px;
    color: var(--mtp-text-tertiary);
  }
</style>
