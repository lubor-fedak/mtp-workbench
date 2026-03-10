<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';
  import type {
    GlobalTheme,
    ThemeMode,
    ThemeFont,
    ThemeDensity,
  } from '../../../shared/types';
  import ColorPicker from '../components/ColorPicker.svelte';

  interface Props {
    theme: GlobalTheme;
    onThemeChange: (theme: GlobalTheme) => void;
    onBack: () => void;
  }

  let { theme, onThemeChange, onBack }: Props = $props();

  // Local copies for immediate UI feedback
  let mode: ThemeMode = $state('system');
  let accent: string = $state('#6366f1');
  let font: ThemeFont = $state('inter');
  let density: ThemeDensity = $state('default');
  let sidebarWidth: number = $state(360);

  // Sync incoming theme prop changes to local state
  $effect(() => {
    mode = theme.mode;
    accent = theme.accent;
    font = theme.font;
    density = theme.density;
    sidebarWidth = theme.sidebar_width;
  });

  function emitChange() {
    onThemeChange({
      mode,
      accent,
      font,
      density,
      sidebar_width: sidebarWidth,
    });
  }

  function setMode(newMode: ThemeMode) {
    mode = newMode;
    emitChange();
  }

  function setAccent(newAccent: string) {
    accent = newAccent;
    emitChange();
  }

  function setFont(newFont: ThemeFont) {
    font = newFont;
    emitChange();
  }

  function setDensity(newDensity: ThemeDensity) {
    density = newDensity;
    emitChange();
  }

  function handleWidthChange(event: Event) {
    const input = event.target as HTMLInputElement;
    sidebarWidth = parseInt(input.value, 10);
    emitChange();
  }

  const fontOptions: { value: ThemeFont; label: string; description: string }[] = [
    { value: 'system', label: 'System Default', description: 'Uses your OS font' },
    { value: 'inter', label: 'Inter', description: 'Clean, modern' },
    { value: 'jetbrains-mono', label: 'JetBrains Mono', description: 'Technical, monospace' },
    { value: 'ibm-plex-sans', label: 'IBM Plex Sans', description: 'Enterprise, professional' },
  ];
</script>

<div class="settings-view">
  <div class="settings-header">
    <button class="btn-icon" onclick={onBack} aria-label="Back">
      <ArrowLeft size={18} />
    </button>
    <h2 class="settings-title">Settings</h2>
  </div>

  <div class="settings-body">
    <!-- Theme mode -->
    <div class="setting-group">
      <h3 class="setting-label">Theme</h3>
      <div class="radio-group">
        <label class="radio-option">
          <input
            type="radio"
            name="theme-mode"
            value="system"
            checked={mode === 'system'}
            onchange={() => setMode('system')}
          />
          <span class="radio-text">System</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="theme-mode"
            value="light"
            checked={mode === 'light'}
            onchange={() => setMode('light')}
          />
          <span class="radio-text">Light</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="theme-mode"
            value="dark"
            checked={mode === 'dark'}
            onchange={() => setMode('dark')}
          />
          <span class="radio-text">Dark</span>
        </label>
      </div>
    </div>

    <!-- Accent color -->
    <div class="setting-group">
      <h3 class="setting-label">Accent Color</h3>
      <ColorPicker
        value={accent}
        onChange={setAccent}
      />
    </div>

    <!-- Font -->
    <div class="setting-group">
      <h3 class="setting-label">Font</h3>
      <div class="font-options">
        {#each fontOptions as option (option.value)}
          <label class="font-option" class:selected={font === option.value}>
            <input
              type="radio"
              name="theme-font"
              value={option.value}
              checked={font === option.value}
              onchange={() => setFont(option.value)}
            />
            <span class="font-name">{option.label}</span>
            <span class="font-desc">{option.description}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Density -->
    <div class="setting-group">
      <h3 class="setting-label">Density</h3>
      <div class="radio-group">
        <label class="radio-option">
          <input
            type="radio"
            name="theme-density"
            value="compact"
            checked={density === 'compact'}
            onchange={() => setDensity('compact')}
          />
          <span class="radio-text">Compact</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="theme-density"
            value="default"
            checked={density === 'default'}
            onchange={() => setDensity('default')}
          />
          <span class="radio-text">Default</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="theme-density"
            value="relaxed"
            checked={density === 'relaxed'}
            onchange={() => setDensity('relaxed')}
          />
          <span class="radio-text">Relaxed</span>
        </label>
      </div>
    </div>

    <!-- Sidebar width -->
    <div class="setting-group">
      <h3 class="setting-label">
        Sidebar Width
        <span class="setting-value">{sidebarWidth}px</span>
      </h3>
      <input
        type="range"
        class="slider"
        min="280"
        max="500"
        step="10"
        value={sidebarWidth}
        oninput={handleWidthChange}
      />
      <div class="slider-labels">
        <span>280px</span>
        <span>500px</span>
      </div>
    </div>
  </div>
</div>

<style>
  .settings-view {
    padding: var(--mtp-spacing);
  }

  .settings-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--mtp-spacing);
  }

  .settings-title {
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

  .settings-body {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .setting-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    font-weight: 700;
    color: var(--mtp-text);
    margin: 0;
  }

  .setting-value {
    font-size: 12px;
    font-weight: 500;
    color: var(--mtp-text-secondary);
  }

  .radio-group {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    border: 1px solid var(--mtp-border);
  }

  .radio-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: calc(var(--mtp-radius) - 2px);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .radio-option:has(input:checked) {
    background: var(--mtp-accent);
  }

  .radio-option:has(input:checked) .radio-text {
    color: #ffffff;
  }

  .radio-option input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .radio-text {
    font-size: 13px;
    font-weight: 500;
    color: var(--mtp-text-secondary);
  }

  .font-options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .font-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--mtp-border);
    border-radius: var(--mtp-radius);
    background: var(--mtp-surface);
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .font-option:hover {
    background: var(--mtp-surface-hover);
  }

  .font-option.selected {
    border-color: var(--mtp-accent);
    background: var(--mtp-surface-hover);
  }

  .font-option input {
    accent-color: var(--mtp-accent);
  }

  .font-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--mtp-text);
  }

  .font-desc {
    font-size: 11px;
    color: var(--mtp-text-secondary);
    margin-left: auto;
  }

  .slider {
    width: 100%;
    height: 4px;
    appearance: none;
    background: var(--mtp-border);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--mtp-accent);
    cursor: pointer;
    border: 2px solid var(--mtp-bg);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--mtp-accent);
    cursor: pointer;
    border: 2px solid var(--mtp-bg);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--mtp-text-secondary);
  }
</style>
