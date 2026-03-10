<script lang="ts">
  import {
    Folder, Star, Heart, Zap, Target, Rocket, Globe, Code,
    Database, FileText, MessageSquare, Users, Shield, Lightbulb,
    BookOpen, Cpu, BarChart3, PieChart, TrendingUp, Search,
    Layers, GitBranch, Terminal, Wrench, Puzzle, Brain,
    Sparkles, Compass, Flag, Award
  } from 'lucide-svelte';
  import type { Component } from 'svelte';

  interface Props {
    value: string;
    type?: 'lucide' | 'emoji';
    onChange: (icon: string, type: 'lucide' | 'emoji') => void;
  }

  let { value, type = 'lucide', onChange }: Props = $props();

  let activeTab: 'icons' | 'emoji' = $state('icons');

  $effect(() => {
    activeTab = type === 'emoji' ? 'emoji' : 'icons';
  });

  const iconMap: Record<string, Component> = {
    'folder': Folder,
    'star': Star,
    'heart': Heart,
    'zap': Zap,
    'target': Target,
    'rocket': Rocket,
    'globe': Globe,
    'code': Code,
    'database': Database,
    'file-text': FileText,
    'message-square': MessageSquare,
    'users': Users,
    'shield': Shield,
    'lightbulb': Lightbulb,
    'book-open': BookOpen,
    'cpu': Cpu,
    'bar-chart-3': BarChart3,
    'pie-chart': PieChart,
    'trending-up': TrendingUp,
    'search': Search,
    'layers': Layers,
    'git-branch': GitBranch,
    'terminal': Terminal,
    'wrench': Wrench,
    'puzzle': Puzzle,
    'brain': Brain,
    'sparkles': Sparkles,
    'compass': Compass,
    'flag': Flag,
    'award': Award,
  };

  const emojis = [
    '🎯', '🚀', '💡', '🔧', '📊', '🧠', '⚡', '🛡️',
    '📁', '🗂️', '✅', '🔍', '💎', '🎨', '📝', '🏗️',
    '🔬', '📈', '🌍', '🤖', '🎲', '🧩', '🔑', '💼',
  ];
</script>

<div class="icon-picker">
  <div class="picker-tabs">
    <button
      class="picker-tab"
      class:active={activeTab === 'icons'}
      onclick={() => (activeTab = 'icons')}
    >
      Icons
    </button>
    <button
      class="picker-tab"
      class:active={activeTab === 'emoji'}
      onclick={() => (activeTab = 'emoji')}
    >
      Emoji
    </button>
  </div>

  {#if activeTab === 'icons'}
    <div class="icon-grid">
      {#each Object.entries(iconMap) as [name, IconComponent]}
        <button
          class="icon-cell"
          class:selected={value === name}
          onclick={() => onChange(name, 'lucide')}
          aria-label={name}
          title={name}
        >
          <IconComponent size={18} />
        </button>
      {/each}
    </div>
  {:else}
    <div class="icon-grid emoji-grid">
      {#each emojis as emoji}
        <button
          class="icon-cell"
          class:selected={value === emoji}
          onclick={() => onChange(emoji, 'emoji')}
          aria-label={emoji}
        >
          {emoji}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .icon-picker {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .picker-tabs {
    display: flex;
    gap: 2px;
    background: var(--mtp-surface);
    border-radius: var(--mtp-radius);
    padding: 2px;
  }

  .picker-tab {
    flex: 1;
    padding: 6px 12px;
    border: none;
    border-radius: calc(var(--mtp-radius) - 2px);
    background: transparent;
    color: var(--mtp-text-secondary);
    font-family: var(--mtp-font);
    font-size: calc(var(--mtp-font-size) - 1px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .picker-tab.active {
    background: var(--mtp-bg);
    color: var(--mtp-text);
    box-shadow: var(--mtp-shadow);
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .icon-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 1;
    border: 1px solid transparent;
    border-radius: var(--mtp-radius);
    background: transparent;
    color: var(--mtp-text-secondary);
    cursor: pointer;
    font-size: 18px;
    transition: all 0.15s ease;
  }

  .icon-cell:hover {
    background: var(--mtp-surface-hover);
    color: var(--mtp-text);
  }

  .icon-cell.selected {
    background: var(--mtp-accent-light);
    color: var(--mtp-accent);
    border-color: var(--mtp-accent);
  }
</style>
