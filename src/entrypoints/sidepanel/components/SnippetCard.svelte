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

  {#if snippet.content_type === 'code'}
    <div class="snippet-code-header">
      {#if snippet.filename}
        <span class="snippet-filename">{snippet.filename}</span>
      {/if}
      {#if snippet.language}
        <span class="snippet-lang">{snippet.language}</span>
      {/if}
    </div>
    <pre class="snippet-code"><code>{snippet.content}</code></pre>
  {:else}
    <p class="snippet-content">{snippet.content}</p>
  {/if}

  <div class="snippet-meta">
    <span class="platform-badge" data-platform={snippet.source_platform}>
      {getPlatformName(snippet.source_platform)}
    </span>

    {#if snippet.content_type === 'code'}
      <span class="badge badge-code">code</span>
    {/if}

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

  .snippet-code-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .snippet-filename {
    font-size: 12px;
    font-weight: 600;
    font-family: var(--mtp-font-mono, 'JetBrains Mono', monospace);
    color: var(--mtp-text);
  }

  .snippet-lang {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mtp-bg);
    color: var(--mtp-accent);
    letter-spacing: 0.3px;
  }

  .snippet-code {
    margin: 0;
    padding: 8px;
    border-radius: var(--mtp-radius);
    background: var(--mtp-bg);
    border: 1px solid var(--mtp-border);
    overflow-x: auto;
    max-height: 80px;
  }

  .snippet-code code {
    font-size: 11px;
    font-family: var(--mtp-font-mono, 'JetBrains Mono', monospace);
    color: var(--mtp-text-secondary);
    line-height: 1.4;
    white-space: pre;
  }

  .badge-code {
    background: rgba(139, 92, 246, 0.15);
    color: #8b5cf6;
  }

  :global([data-theme='dark']) .badge-code {
    background: rgba(139, 92, 246, 0.2);
    color: #a78bfa;
  }
</style>
