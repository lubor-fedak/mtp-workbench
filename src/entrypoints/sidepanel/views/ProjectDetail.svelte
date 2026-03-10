<script lang="ts">
  import { ArrowLeft, Save, Plus, Wand2 } from 'lucide-svelte';
  import { v4 as uuidv4 } from 'uuid';
  import type {
    Project,
    ContextSnippet,
    MethodologyPackage,
    ExecutionRecord,
    ProjectAppearance,
    Platform,
    MessageResponse,
  } from '../../../shared/types';
  import IconPicker from '../components/IconPicker.svelte';
  import ColorPicker from '../components/ColorPicker.svelte';
  import SnippetCard from '../components/SnippetCard.svelte';
  import MethodologyView from '../components/MethodologyView.svelte';
  import DriftGauge from '../components/DriftGauge.svelte';

  interface Props {
    projectId: string | null;
    onBack: () => void;
    onCompose: (id: string) => void;
  }

  let { projectId, onBack, onCompose }: Props = $props();

  let isCreateMode = $derived(projectId === null);

  // Form state
  let name: string = $state('');
  let description: string = $state('');
  let tagsInput: string = $state('');
  let appearance: ProjectAppearance = $state({
    icon: 'folder',
    icon_type: 'lucide',
    color: '#6366f1',
  });

  // Data state
  let project: Project | null = $state(null);
  let snippets: ContextSnippet[] = $state([]);
  let packages: MethodologyPackage[] = $state([]);
  let records: ExecutionRecord[] = $state([]);
  let loading: boolean = $state(true);
  let saving: boolean = $state(false);

  // Tab state
  type Tab = 'context' | 'packages' | 'reports';
  let activeTab: Tab = $state('context');

  // Inline snippet form
  let showSnippetForm: boolean = $state(false);
  let snippetTitle: string = $state('');
  let snippetContent: string = $state('');
  let snippetPlatform: Platform = $state('other');

  $effect(() => {
    if (projectId) {
      loadProject(projectId);
    } else {
      loading = false;
    }
  });

  function loadProject(id: string) {
    loading = true;
    snippets = [];
    packages = [];
    records = [];
    project = null;
    chrome.runtime.sendMessage(
      { type: 'GET_PROJECTS' },
      (response: MessageResponse<Project[]>) => {
        if (response?.success && response.data) {
          const found = response.data.find((p) => p.id === id);
          if (found) {
            project = found;
            name = found.name;
            description = found.description ?? '';
            tagsInput = found.tags.join(', ');
            appearance = { ...found.appearance };
          }
        }
        loading = false;
      },
    );

    chrome.runtime.sendMessage(
      { type: 'GET_SNIPPETS', payload: { project_id: id } },
      (response: MessageResponse<ContextSnippet[]>) => {
        if (response?.success && response.data) {
          snippets = response.data;
        }
      },
    );

    chrome.runtime.sendMessage(
      { type: 'GET_PACKAGES', payload: { project_id: id } },
      (response: MessageResponse<MethodologyPackage[]>) => {
        if (response?.success && response.data) {
          packages = response.data;
        }
      },
    );

    chrome.runtime.sendMessage(
      { type: 'GET_RECORDS', payload: { project_id: id } },
      (response: MessageResponse<ExecutionRecord[]>) => {
        if (response?.success && response.data) {
          records = response.data;
        }
      },
    );
  }

  function parseTags(input: string): string[] {
    return input
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  function handleSave() {
    saving = true;
    const tags = parseTags(tagsInput);
    const now = new Date().toISOString();

    if (isCreateMode) {
      const newProject: Project = {
        id: uuidv4(),
        name,
        description: description || undefined,
        tags,
        appearance: { ...appearance },
        created_at: now,
        updated_at: now,
        sort_order: 0,
      };
      chrome.runtime.sendMessage(
        { type: 'CREATE_PROJECT', payload: newProject },
        (response: MessageResponse<Project>) => {
          saving = false;
          if (response?.success) {
            onBack();
          }
        },
      );
    } else if (project) {
      const updated: Project = {
        ...project,
        name,
        description: description || undefined,
        tags,
        appearance: { ...appearance },
        updated_at: now,
      };
      chrome.runtime.sendMessage(
        { type: 'UPDATE_PROJECT', payload: updated },
        (response: MessageResponse) => {
          saving = false;
          if (response?.success) {
            project = updated;
          }
        },
      );
    }
  }

  function handleAddSnippet() {
    if (!projectId || !snippetTitle.trim() || !snippetContent.trim()) return;

    const snippet: ContextSnippet = {
      id: uuidv4(),
      project_id: projectId,
      title: snippetTitle,
      content: snippetContent,
      source_platform: snippetPlatform,
      tags: [],
      created_at: new Date().toISOString(),
    };

    chrome.runtime.sendMessage(
      { type: 'CREATE_SNIPPET', payload: snippet },
      (response: MessageResponse<ContextSnippet>) => {
        if (response?.success) {
          snippets = [...snippets, snippet];
          snippetTitle = '';
          snippetContent = '';
          snippetPlatform = 'other';
          showSnippetForm = false;
        }
      },
    );
  }

  function handleDeleteSnippet(snippetId: string) {
    chrome.runtime.sendMessage(
      { type: 'DELETE_SNIPPET', payload: { id: snippetId } },
      (response: MessageResponse) => {
        if (response?.success) {
          snippets = snippets.filter((s) => s.id !== snippetId);
        }
      },
    );
  }

  function handleDeletePackage(packageId: string) {
    chrome.runtime.sendMessage(
      { type: 'DELETE_PACKAGE', payload: { id: packageId } },
      (response: MessageResponse) => {
        if (response?.success) {
          packages = packages.filter((p) => p.id !== packageId);
        }
      },
    );
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'var(--mtp-accent)';
      case 'partial': return '#f59e0b';
      case 'deviation': return '#f97316';
      case 'failure': return '#ef4444';
      case 'skipped': return 'var(--mtp-text-secondary)';
      case 'escalated': return '#8b5cf6';
      default: return 'var(--mtp-text-secondary)';
    }
  }
</script>

<div class="detail-view">
  <div class="detail-header">
    <button class="btn-icon" onclick={onBack} aria-label="Back">
      <ArrowLeft size={18} />
    </button>
    {#if isCreateMode}
      <h2 class="detail-title">New Project</h2>
    {:else}
      <h2 class="detail-title">{name || 'Untitled'}</h2>
    {/if}
    <div class="header-actions">
      {#if !isCreateMode && projectId}
        <button class="btn-secondary" onclick={() => onCompose(projectId!)}>
          <Wand2 size={14} />
          Compose
        </button>
      {/if}
      <button class="btn-primary" onclick={handleSave} disabled={saving || !name.trim()}>
        <Save size={14} />
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  </div>

  {#if loading}
    <div class="loading-state">
      <p>Loading...</p>
    </div>
  {:else}
    <!-- Project form (always shown in create mode, collapsible in edit mode) -->
    <div class="project-form">
      <div class="form-group">
        <label class="form-label" for="project-name">Name</label>
        <input
          id="project-name"
          class="form-input"
          type="text"
          bind:value={name}
          placeholder="Project name"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="project-desc">Description</label>
        <textarea
          id="project-desc"
          class="form-textarea"
          bind:value={description}
          placeholder="What is this project about?"
          rows="2"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="project-tags">Tags (comma-separated)</label>
        <input
          id="project-tags"
          class="form-input"
          type="text"
          bind:value={tagsInput}
          placeholder="churn, ml, scoring"
        />
      </div>

      <div class="form-row">
        <div class="form-group form-group-half">
          <span class="form-label">Icon</span>
          <IconPicker
            value={appearance.icon}
            type={appearance.icon_type}
            onChange={(icon, type) => { appearance.icon = icon; appearance.icon_type = type; }}
          />
        </div>
        <div class="form-group form-group-half">
          <span class="form-label">Color</span>
          <ColorPicker
            value={appearance.color}
            onChange={(color) => { appearance.color = color; }}
          />
        </div>
      </div>
    </div>

    <!-- Tabs (only in edit mode) -->
    {#if !isCreateMode}
      <div class="tabs">
        <button
          class="tab"
          class:active={activeTab === 'context'}
          onclick={() => { activeTab = 'context'; }}
        >
          Context ({snippets.length})
        </button>
        <button
          class="tab"
          class:active={activeTab === 'packages'}
          onclick={() => { activeTab = 'packages'; }}
        >
          Packages ({packages.length})
        </button>
        <button
          class="tab"
          class:active={activeTab === 'reports'}
          onclick={() => { activeTab = 'reports'; }}
        >
          Reports ({records.length})
        </button>
      </div>

      <div class="tab-content">
        {#if activeTab === 'context'}
          <div class="tab-header">
            <button class="btn-secondary" onclick={() => { showSnippetForm = !showSnippetForm; }}>
              <Plus size={14} />
              Add Snippet
            </button>
          </div>

          {#if showSnippetForm}
            <div class="snippet-form">
              <input
                class="form-input"
                type="text"
                bind:value={snippetTitle}
                placeholder="Snippet title"
              />
              <textarea
                class="form-textarea"
                bind:value={snippetContent}
                placeholder="Snippet content"
                rows="4"
              ></textarea>
              <select class="form-select" bind:value={snippetPlatform}>
                <option value="claude">Claude</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="gemini">Gemini</option>
                <option value="copilot">Copilot</option>
                <option value="other">Other</option>
              </select>
              <div class="snippet-form-actions">
                <button class="btn-secondary" onclick={() => { showSnippetForm = false; }}>Cancel</button>
                <button
                  class="btn-primary"
                  onclick={handleAddSnippet}
                  disabled={!snippetTitle.trim() || !snippetContent.trim()}
                >
                  Save Snippet
                </button>
              </div>
            </div>
          {/if}

          {#if snippets.length === 0}
            <p class="empty-tab">No snippets yet. Add context to build better prompts.</p>
          {:else}
            <div class="card-list">
              {#each snippets as snippet (snippet.id)}
                <SnippetCard {snippet} onEdit={() => {}} onDelete={() => handleDeleteSnippet(snippet.id)} />
              {/each}
            </div>
          {/if}

        {:else if activeTab === 'packages'}
          {#if packages.length === 0}
            <p class="empty-tab">No methodology packages. Extract packages from AI conversations.</p>
          {:else}
            <div class="card-list">
              {#each packages as pkg (pkg.id)}
                <MethodologyView pkg={pkg} onDelete={() => handleDeletePackage(pkg.id)} />
              {/each}
            </div>
          {/if}

        {:else if activeTab === 'reports'}
          {#if records.length === 0}
            <p class="empty-tab">No execution records yet. Track methodology execution to measure drift.</p>
          {:else}
            <div class="card-list">
              {#each records as record (record.id)}
                <div class="record-card">
                  <div class="record-header">
                    <span
                      class="record-status"
                      style="color: {getStatusColor(record.overall_status)}"
                    >
                      {record.overall_status}
                    </span>
                    <span class="record-platform">{record.target_platform}</span>
                    <span class="record-date">
                      {new Date(record.executed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <DriftGauge score={record.drift_score} />
                  {#if record.notes}
                    <p class="record-notes">{record.notes}</p>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .detail-view {
    padding: var(--mtp-spacing);
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--mtp-spacing);
  }

  .detail-title {
    flex: 1;
    font-size: 16px;
    font-weight: 700;
    color: var(--mtp-text);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
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
    padding: 6px 12px;
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
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
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

  .loading-state {
    display: flex;
    justify-content: center;
    padding: 48px 24px;
    color: var(--mtp-text-secondary);
  }

  .project-form {
    display: flex;
    flex-direction: column;
    gap: var(--mtp-spacing);
    padding-bottom: var(--mtp-spacing);
    border-bottom: 1px solid var(--mtp-border);
    margin-bottom: var(--mtp-spacing);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-group-half {
    flex: 1;
  }

  .form-row {
    display: flex;
    gap: var(--mtp-spacing);
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
    font-size: 14px;
    resize: vertical;
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

  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--mtp-border);
    margin-bottom: var(--mtp-spacing);
  }

  .tab {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--mtp-text-secondary);
    font-family: var(--mtp-font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .tab:hover {
    color: var(--mtp-text);
  }

  .tab.active {
    color: var(--mtp-accent);
    border-bottom-color: var(--mtp-accent);
  }

  .tab-content {
    min-height: 120px;
  }

  .tab-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: var(--mtp-spacing);
  }

  .snippet-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: var(--mtp-spacing);
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    margin-bottom: var(--mtp-spacing);
  }

  .snippet-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .empty-tab {
    text-align: center;
    padding: 32px 16px;
    color: var(--mtp-text-secondary);
    font-size: 13px;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .record-card {
    padding: var(--mtp-spacing);
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
  }

  .record-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .record-status {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .record-platform {
    font-size: 12px;
    color: var(--mtp-text-secondary);
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mtp-bg);
  }

  .record-date {
    margin-left: auto;
    font-size: 11px;
    color: var(--mtp-text-secondary);
  }

  .record-notes {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--mtp-text-secondary);
    font-style: italic;
  }
</style>
