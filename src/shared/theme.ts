// ============================================================
// Theme System — CSS Variable Mapping & Defaults
// ============================================================

import type { GlobalTheme, ThemeDensity, ThemeFont, ThemeMode } from './types';

export const DEFAULT_THEME: GlobalTheme = {
  mode: 'system',
  accent: '#6366f1',
  font: 'inter',
  density: 'default',
  sidebar_width: 360,
};

export const PROJECT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6b7280', // gray
  '#78716c', // stone
] as const;

const FONT_STACKS: Record<ThemeFont, string> = {
  system: 'system-ui, -apple-system, sans-serif',
  inter: "'Inter', system-ui, sans-serif",
  'jetbrains-mono': "'JetBrains Mono', monospace",
  'ibm-plex-sans': "'IBM Plex Sans', system-ui, sans-serif",
};

const DENSITY_VALUES: Record<ThemeDensity, { radius: string; spacing: string; fontSize: string }> =
  {
    compact: { radius: '4px', spacing: '8px', fontSize: '13px' },
    default: { radius: '8px', spacing: '12px', fontSize: '14px' },
    relaxed: { radius: '12px', spacing: '16px', fontSize: '15px' },
  };

export function applyTheme(theme: GlobalTheme): void {
  const root = document.documentElement;

  // Resolve effective mode
  const effectiveMode = resolveThemeMode(theme.mode);
  root.setAttribute('data-theme', effectiveMode);
  root.setAttribute('data-density', theme.density);

  // CSS custom properties
  root.style.setProperty('--user-accent', theme.accent);
  root.style.setProperty('--user-font', FONT_STACKS[theme.font]);

  const density = DENSITY_VALUES[theme.density];
  root.style.setProperty('--density-radius', density.radius);
  root.style.setProperty('--density-spacing', density.spacing);
  root.style.setProperty('--density-font-size', density.fontSize);

  root.style.setProperty('--mtp-sidebar-width', `${theme.sidebar_width}px`);
}

export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => callback(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
