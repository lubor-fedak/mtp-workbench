<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { GlobalTheme } from '../../../shared/types';

  interface Props {
    theme: GlobalTheme;
    children: Snippet;
  }

  let { theme, children }: Props = $props();
</script>

<div class="theme-provider" data-accent={theme.accent}>
  {@render children()}
</div>

<style>
  .theme-provider {
    display: contents;
  }
</style>
