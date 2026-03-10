<script lang="ts">
  import { FolderOpen, Wand2, Gauge, Settings } from 'lucide-svelte';
  import type { SidebarView } from '../../../shared/types';

  interface Props {
    currentView: SidebarView;
    onNavigate: (view: SidebarView) => void;
  }

  let { currentView, onNavigate }: Props = $props();

  const tabs = [
    { view: 'projects' as SidebarView, label: 'Projects', icon: FolderOpen },
    { view: 'compose' as SidebarView, label: 'Compose', icon: Wand2 },
    { view: 'drift' as SidebarView, label: 'Drift', icon: Gauge },
    { view: 'settings' as SidebarView, label: 'Settings', icon: Settings },
  ];

  function isActive(tabView: SidebarView): boolean {
    if (tabView === 'projects') {
      return currentView === 'projects' || currentView === 'project-detail' || currentView === 'capture';
    }
    return currentView === tabView;
  }
</script>

<nav class="nav-bar">
  {#each tabs as tab}
    <button
      class="nav-tab"
      class:active={isActive(tab.view)}
      onclick={() => onNavigate(tab.view)}
      aria-label={tab.label}
    >
      <tab.icon size={20} strokeWidth={isActive(tab.view) ? 2.5 : 2} />
      <span class="nav-label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  .nav-bar {
    display: flex;
    align-items: stretch;
    border-top: 1px solid var(--mtp-border);
    background: var(--mtp-bg);
    flex-shrink: 0;
  }

  .nav-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px 6px;
    border: none;
    background: transparent;
    color: var(--mtp-text-tertiary);
    cursor: pointer;
    transition: color 0.15s ease;
    font-family: var(--mtp-font);
    font-size: 11px;
    font-weight: 500;
  }

  .nav-tab:hover {
    color: var(--mtp-text-secondary);
  }

  .nav-tab.active {
    color: var(--mtp-accent);
  }

  .nav-label {
    line-height: 1;
  }
</style>
