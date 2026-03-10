<script lang="ts">
  import type { Platform } from '../../../shared/types';

  interface Props {
    value: Platform;
    onChange: (platform: Platform) => void;
  }

  let { value, onChange }: Props = $props();

  const platforms: { id: Platform; name: string; color: string }[] = [
    { id: 'claude', name: 'Claude', color: '#7c3aed' },
    { id: 'chatgpt', name: 'ChatGPT', color: '#16a34a' },
    { id: 'gemini', name: 'Gemini', color: '#2563eb' },
    { id: 'copilot', name: 'Copilot', color: '#0284c7' },
    { id: 'other', name: 'Other', color: '#6b7280' },
  ];

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    onChange(target.value as Platform);
  }
</script>

<div class="platform-selector">
  <span
    class="platform-dot"
    style:background={platforms.find((p) => p.id === value)?.color ?? '#6b7280'}
  ></span>
  <select class="input platform-select" {value} onchange={handleChange}>
    {#each platforms as platform}
      <option value={platform.id}>{platform.name}</option>
    {/each}
  </select>
</div>

<style>
  .platform-selector {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .platform-dot {
    position: absolute;
    left: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 1;
  }

  .platform-select {
    padding-left: 26px;
    cursor: pointer;
    appearance: auto;
  }
</style>
