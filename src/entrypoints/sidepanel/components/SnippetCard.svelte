<script lang="ts">
  import { Pencil, Trash2 } from 'lucide-svelte';
  import type { ContextSnippet } from '../../../shared/types';
  import { getPlatformName } from '../../../shared/platforms';

  interface Props {
    snippet: ContextSnippet;
    onEdit: () => void;
    onDelete: () => void;
  }

  let { snippet, onEdit, onDelete }: Props = $props();

  let formattedDate = $derived(
    new Date(snippet.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  );
</script>

<div class="card snippet-card">
  <div class="snippet-header">
    <h3 class="snippet-title">{snippet.title}</h3>
    <div class="snippet-actions">
      <button class="btn btn-ghost btn-icon" onclick={onEdit} aria-label="Edit snippet">
        <Pencil size={14} />
      </button>
      <button class="btn btn-ghost btn-icon" onclick={onDelete} aria-label="Delete snippet">
        <Trash2 size={14} />
      </button>
    </div>
  </div>

  <p class="snippet-content">{snippet.content}</p>

  <div class="snippet-meta">
    <span class="platform-badge" data-platform={snippet.source_platform}>
      {getPlatformName(snippet.source_platform)}
    </span>

    {#each snippet.tags as tag}
      <span class="badge">{tag}</span>
    {/each}

    <span class="snippet-date">{formattedDate}</span>
  </div>
</div>

<style>
  .snippet-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .snippet-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .snippet-title {
    font-size: var(--mtp-font-size);
    font-weight: 600;
    color: var(--mtp-text);
    line-height: 1.3;
  }

  .snippet-actions {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .snippet-content {
    font-size: calc(var(--mtp-font-size) - 1px);
    color: var(--mtp-text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .snippet-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  .platform-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 500;
    background: var(--mtp-surface-active);
    color: var(--mtp-text-secondary);
  }

  .platform-badge[data-platform='claude'] {
    background: #f3e8ff;
    color: #7c3aed;
  }

  .platform-badge[data-platform='chatgpt'] {
    background: #dcfce7;
    color: #16a34a;
  }

  .platform-badge[data-platform='gemini'] {
    background: #dbeafe;
    color: #2563eb;
  }

  .platform-badge[data-platform='copilot'] {
    background: #e0f2fe;
    color: #0284c7;
  }

  :global([data-theme='dark']) .platform-badge[data-platform='claude'] {
    background: rgba(139, 92, 246, 0.2);
    color: #a78bfa;
  }

  :global([data-theme='dark']) .platform-badge[data-platform='chatgpt'] {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
  }

  :global([data-theme='dark']) .platform-badge[data-platform='gemini'] {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }

  :global([data-theme='dark']) .platform-badge[data-platform='copilot'] {
    background: rgba(14, 165, 233, 0.2);
    color: #38bdf8;
  }

  .snippet-date {
    font-size: 11px;
    color: var(--mtp-text-tertiary);
    margin-left: auto;
  }
</style>
