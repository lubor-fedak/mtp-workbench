<script lang="ts">
  import { Trash2, ListOrdered, AlertTriangle, ShieldAlert } from 'lucide-svelte';
  import type { MethodologyPackage } from '../../../shared/types';

  interface Props {
    pkg: MethodologyPackage;
    onDelete: () => void;
  }

  let { pkg, onDelete }: Props = $props();

  interface Step {
    name?: string;
    description?: string;
    [key: string]: unknown;
  }

  let steps = $derived<Step[]>(
    (() => {
      const mtp = pkg.mtp_package as Record<string, unknown>;
      const methodology = mtp?.methodology as Record<string, unknown> | undefined;
      const rawSteps = methodology?.steps;
      if (Array.isArray(rawSteps)) return rawSteps as Step[];
      return [];
    })()
  );
</script>

<div class="methodology-view">
  <div class="methodology-header">
    <div class="methodology-info">
      <h2 class="methodology-name">{pkg.display_name}</h2>
      <p class="methodology-summary">{pkg.summary}</p>
    </div>
    <button class="btn btn-ghost btn-icon" onclick={onDelete} aria-label="Delete package">
      <Trash2 size={16} />
    </button>
  </div>

  <div class="methodology-badges">
    <span class="badge badge-steps">
      <ListOrdered size={12} />
      {pkg.step_count} steps
    </span>
    <span class="badge badge-edge">
      <AlertTriangle size={12} />
      {pkg.edge_case_count} edge cases
    </span>
    <span class="badge badge-dead">
      <ShieldAlert size={12} />
      {pkg.dead_end_count} dead ends
    </span>
  </div>

  {#if steps.length > 0}
    <ol class="step-list">
      {#each steps as step, i}
        <li class="step-item">
          <span class="step-number">{i + 1}</span>
          <div class="step-content">
            <span class="step-name">{step.name ?? `Step ${i + 1}`}</span>
            {#if step.description}
              <span class="step-description">{step.description}</span>
            {/if}
          </div>
        </li>
      {/each}
    </ol>
  {:else}
    <div class="empty-state">
      <p>No steps found in this package.</p>
    </div>
  {/if}
</div>

<style>
  .methodology-view {
    display: flex;
    flex-direction: column;
    gap: var(--mtp-spacing);
  }

  .methodology-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .methodology-info {
    flex: 1;
    min-width: 0;
  }

  .methodology-name {
    font-size: calc(var(--mtp-font-size) + 2px);
    font-weight: 700;
    color: var(--mtp-text);
    line-height: 1.3;
  }

  .methodology-summary {
    margin-top: 4px;
    font-size: var(--mtp-font-size);
    color: var(--mtp-text-secondary);
    line-height: 1.5;
  }

  .methodology-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .methodology-badges .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .badge-steps {
    background: color-mix(in srgb, var(--mtp-accent) 15%, transparent);
    color: var(--mtp-accent);
  }

  .badge-edge {
    background: color-mix(in srgb, var(--mtp-warning) 15%, transparent);
    color: var(--mtp-warning);
  }

  .badge-dead {
    background: color-mix(in srgb, var(--mtp-danger) 15%, transparent);
    color: var(--mtp-danger);
  }

  .step-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .step-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--mtp-radius);
    transition: background 0.15s ease;
  }

  .step-item:hover {
    background: var(--mtp-surface-hover);
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--mtp-accent-light);
    color: var(--mtp-accent);
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .step-name {
    font-size: var(--mtp-font-size);
    font-weight: 600;
    color: var(--mtp-text);
  }

  .step-description {
    font-size: calc(var(--mtp-font-size) - 1px);
    color: var(--mtp-text-secondary);
    line-height: 1.4;
  }
</style>
