<script lang="ts">
  import type { GlobalTheme, SidebarView } from '../../shared/types';
  import { applyTheme, DEFAULT_THEME, watchSystemTheme } from '../../shared/theme';
  import Projects from './views/Projects.svelte';
  import ProjectDetail from './views/ProjectDetail.svelte';
  import Compose from './views/Compose.svelte';
  import Capture from './views/Capture.svelte';
  import DriftDashboard from './views/DriftDashboard.svelte';
  import Settings from './views/Settings.svelte';
  import ThemeProvider from './components/ThemeProvider.svelte';
  import Navigation from './components/Navigation.svelte';

  import type { CodeBlock } from '../../shared/types';
  import CaptureCodeBlocks from './views/CaptureCodeBlocks.svelte';

  let currentView: SidebarView = $state('projects');
  let selectedProjectId: string | null = $state(null);
  let capturedText: string = $state('');
  let capturedUrl: string = $state('');
  let capturedCodeBlocks: CodeBlock[] = $state([]);
  let theme: GlobalTheme = $state({ ...DEFAULT_THEME });

  // Load theme on mount
  $effect(() => {
    chrome.runtime.sendMessage({ type: 'GET_THEME' }, (response) => {
      if (response?.success && response.data) {
        theme = response.data;
      }
      applyTheme(theme);
    });

    // Watch system theme changes
    const themeCleanup = watchSystemTheme(() => {
      if (theme.mode === 'system') {
        applyTheme(theme);
      }
    });

    // Listen for capture events from background
    const captureHandler = (message: { type: string; payload?: any }) => {
      if (message.type === 'CAPTURED_TEXT') {
        capturedText = message.payload.text;
        capturedUrl = message.payload.url;
        currentView = 'capture';
      }
      if (message.type === 'CAPTURED_CODE_BLOCK') {
        capturedCodeBlocks = message.payload.blocks;
        capturedUrl = message.payload.url;
        currentView = 'capture-code';
      }
    };
    chrome.runtime.onMessage.addListener(captureHandler);

    return () => {
      themeCleanup();
      chrome.runtime.onMessage.removeListener(captureHandler);
    };
  });

  function navigate(view: SidebarView, projectId?: string) {
    currentView = view;
    if (projectId !== undefined) {
      selectedProjectId = projectId;
    }
  }

  function handleThemeChange(newTheme: GlobalTheme) {
    theme = newTheme;
    applyTheme(theme);
    chrome.runtime.sendMessage({ type: 'SET_THEME', payload: theme });
  }
</script>

<ThemeProvider {theme}>
  <div class="app-shell">
    <header class="app-header">
      <h1 class="app-title">MTP Workbench</h1>
      <span class="app-version">v0.1</span>
    </header>

    <main class="app-content">
      {#if currentView === 'projects'}
        <Projects
          onSelect={(id) => navigate('project-detail', id)}
          onCreate={() => navigate('project-detail')}
        />
      {:else if currentView === 'project-detail'}
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={() => navigate('projects')}
          onCompose={(id) => { selectedProjectId = id; navigate('compose'); }}
        />
      {:else if currentView === 'compose'}
        <Compose
          projectId={selectedProjectId}
          onBack={() => navigate('project-detail', selectedProjectId ?? undefined)}
        />
      {:else if currentView === 'capture'}
        <Capture
          text={capturedText}
          sourceUrl={capturedUrl}
          onSaved={() => navigate('projects')}
          onCancel={() => navigate('projects')}
        />
      {:else if currentView === 'capture-code'}
        <CaptureCodeBlocks
          blocks={capturedCodeBlocks}
          sourceUrl={capturedUrl}
          onSaved={() => navigate('projects')}
          onCancel={() => navigate('projects')}
        />
      {:else if currentView === 'drift'}
        <DriftDashboard onBack={() => navigate('projects')} />
      {:else if currentView === 'settings'}
        <Settings
          {theme}
          onThemeChange={handleThemeChange}
          onBack={() => navigate('projects')}
        />
      {/if}
    </main>

    <Navigation
      {currentView}
      onNavigate={(view) => navigate(view)}
    />
  </div>
</ThemeProvider>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .app-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--mtp-border);
    flex-shrink: 0;
  }

  .app-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--mtp-text);
  }

  .app-version {
    font-size: 11px;
    color: var(--mtp-text-tertiary);
    background: var(--mtp-surface);
    padding: 1px 6px;
    border-radius: 4px;
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
