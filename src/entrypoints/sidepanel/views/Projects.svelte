<script lang="ts">
  import { Plus } from 'lucide-svelte';
  import type { Project, MessageResponse } from '../../../shared/types';

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

  function truncate(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
</script>

<div class="projects-view">
  <div class="projects-header">
    <h2 class="projects-title">Projects</h2>
    <button class="btn-primary" onclick={onCreate}>
      <Plus size={16} />
      New Project
    </button>
  </div>

  {#if loading}
    <div class="loading-state">
      <p>Loading projects...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <p>{error}</p>
      <button class="btn-secondary" onclick={loadProjects}>Retry</button>
    </div>
  {:else if projects.length === 0}
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
  {:else}
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
</style>
