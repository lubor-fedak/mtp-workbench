<script lang="ts">
  import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-svelte';
  import type {
    Project,
    ExecutionRecord,
    MessageResponse,
  } from '../../../shared/types';
  import DriftGauge from '../components/DriftGauge.svelte';

  interface Props {
    onBack: () => void;
  }

  let { onBack }: Props = $props();

  interface ProjectWithRecords {
    project: Project;
    records: ExecutionRecord[];
    avgDrift: number;
    expanded: boolean;
  }

  let projectData: ProjectWithRecords[] = $state([]);
  let loading: boolean = $state(true);

  let totalExecutions = $derived(
    projectData.reduce((sum, pd) => sum + pd.records.length, 0),
  );

  let overallAvgDrift = $derived.by(() => {
    const allRecords = projectData.flatMap((pd) => pd.records);
    if (allRecords.length === 0) return 0;
    return allRecords.reduce((sum, r) => sum + r.drift_score, 0) / allRecords.length;
  });

  $effect(() => {
    loadAllData();
  });

  function loadAllData() {
    loading = true;

    chrome.runtime.sendMessage(
      { type: 'GET_PROJECTS' },
      (response: MessageResponse<Project[]>) => {
        if (!response?.success || !response.data) {
          loading = false;
          return;
        }

        const projects = response.data;

        if (projects.length === 0) {
          loading = false;
          return;
        }

        let loaded = 0;
        const results: ProjectWithRecords[] = [];

        for (const project of projects) {
          chrome.runtime.sendMessage(
            { type: 'GET_RECORDS', payload: { project_id: project.id } },
            (recResponse: MessageResponse<ExecutionRecord[]>) => {
              const records = recResponse?.success && recResponse.data ? recResponse.data : [];
              const avgDrift =
                records.length > 0
                  ? records.reduce((sum, r) => sum + r.drift_score, 0) / records.length
                  : 0;

              results.push({
                project,
                records,
                avgDrift,
                expanded: false,
              });

              loaded++;
              if (loaded === projects.length) {
                projectData = results.sort((a, b) => b.records.length - a.records.length);
                loading = false;
              }
            },
          );
        }
      },
    );
  }

  function toggleExpand(index: number) {
    projectData[index].expanded = !projectData[index].expanded;
  }

  function formatDrift(score: number): string {
    return (score * 100).toFixed(1) + '%';
  }

  function getDriftColor(score: number): string {
    if (score >= 0.9) return '#22c55e';
    if (score >= 0.7) return '#f59e0b';
    if (score >= 0.5) return '#f97316';
    return '#ef4444';
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'success': return '#22c55e';
      case 'partial': return '#f59e0b';
      case 'deviation': return '#f97316';
      case 'failure': return '#ef4444';
      case 'skipped': return 'var(--mtp-text-secondary)';
      case 'escalated': return '#8b5cf6';
      default: return 'var(--mtp-text-secondary)';
    }
  }
</script>

<div class="drift-view">
  <div class="drift-header">
    <button class="btn-icon" onclick={onBack} aria-label="Back">
      <ArrowLeft size={18} />
    </button>
    <h2 class="drift-title">Drift Dashboard</h2>
  </div>

  {#if loading}
    <div class="loading-state">
      <p>Loading drift data...</p>
    </div>
  {:else}
    <!-- Summary stats -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{totalExecutions}</span>
        <span class="stat-label">Total Executions</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color: {getDriftColor(overallAvgDrift)}">
          {formatDrift(overallAvgDrift)}
        </span>
        <span class="stat-label">Average Drift Score</span>
      </div>
    </div>

    {#if projectData.length === 0}
      <div class="empty-state">
        <p>No projects found. Create projects and track executions to see drift trends.</p>
      </div>
    {:else}
      <div class="project-drift-list">
        {#each projectData as pd, index (pd.project.id)}
          <div class="project-drift-card">
            <button
              class="project-drift-header"
              onclick={() => toggleExpand(index)}
            >
              <span class="expand-icon">
                {#if pd.expanded}
                  <ChevronDown size={16} />
                {:else}
                  <ChevronRight size={16} />
                {/if}
              </span>
              <span
                class="project-drift-color"
                style="background: {pd.project.appearance.color}"
              ></span>
              <span class="project-drift-name">{pd.project.name}</span>
              <span class="project-drift-count">{pd.records.length} runs</span>
              {#if pd.records.length > 0}
                <span
                  class="project-drift-score"
                  style="color: {getDriftColor(pd.avgDrift)}"
                >
                  {formatDrift(pd.avgDrift)}
                </span>
              {:else}
                <span class="project-drift-score no-data">--</span>
              {/if}
            </button>

            {#if pd.expanded && pd.records.length > 0}
              <div class="record-list">
                {#each pd.records as record (record.id)}
                  <div class="record-item">
                    <div class="record-meta">
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
                  </div>
                {/each}
              </div>
            {:else if pd.expanded}
              <div class="record-list">
                <p class="no-records">No execution records for this project.</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .drift-view {
    padding: var(--mtp-spacing);
  }

  .drift-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--mtp-spacing);
  }

  .drift-title {
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

  .loading-state,
  .empty-state {
    display: flex;
    justify-content: center;
    padding: 48px 24px;
    color: var(--mtp-text-secondary);
    text-align: center;
  }

  .stats-row {
    display: flex;
    gap: var(--mtp-spacing);
    margin-bottom: var(--mtp-spacing);
  }

  .stat-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px 12px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--mtp-text);
  }

  .stat-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--mtp-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .project-drift-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .project-drift-card {
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    overflow: hidden;
  }

  .project-drift-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: transparent;
    color: var(--mtp-text);
    cursor: pointer;
    font-family: var(--mtp-font);
    font-size: 13px;
    text-align: left;
    transition: background 0.15s ease;
  }

  .project-drift-header:hover {
    background: var(--mtp-surface-hover);
  }

  .expand-icon {
    display: flex;
    align-items: center;
    color: var(--mtp-text-secondary);
    flex-shrink: 0;
  }

  .project-drift-color {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .project-drift-name {
    flex: 1;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .project-drift-count {
    font-size: 11px;
    color: var(--mtp-text-secondary);
    flex-shrink: 0;
  }

  .project-drift-score {
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    min-width: 48px;
    text-align: right;
  }

  .project-drift-score.no-data {
    color: var(--mtp-text-secondary);
  }

  .record-list {
    border-top: 1px solid var(--mtp-border);
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .record-item {
    padding: 8px;
    border-radius: var(--mtp-radius);
    background: var(--mtp-bg);
  }

  .record-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .record-status {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .record-platform {
    font-size: 11px;
    color: var(--mtp-text-secondary);
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--mtp-surface);
  }

  .record-date {
    margin-left: auto;
    font-size: 11px;
    color: var(--mtp-text-secondary);
  }

  .no-records {
    font-size: 12px;
    color: var(--mtp-text-secondary);
    text-align: center;
    margin: 0;
    padding: 8px 0;
  }
</style>
