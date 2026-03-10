<script lang="ts">
  import { Check } from 'lucide-svelte';
  import { PROJECT_COLORS } from '../../../shared/theme';

  interface Props {
    value: string;
    onChange: (color: string) => void;
  }

  let { value, onChange }: Props = $props();
</script>

<div class="color-picker">
  {#each PROJECT_COLORS as color}
    <button
      class="color-swatch"
      class:selected={value === color}
      style:background={color}
      onclick={() => onChange(color)}
      aria-label="Select color {color}"
    >
      {#if value === color}
        <Check size={14} color="white" strokeWidth={3} />
      {/if}
    </button>
  {/each}
</div>

<style>
  .color-picker {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }

  .color-swatch {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .color-swatch:hover {
    transform: scale(1.15);
  }

  .color-swatch.selected {
    border-color: var(--mtp-text);
    transform: scale(1.1);
  }
</style>
