<script lang="ts">
  interface Props {
    score: number;
    label?: string;
  }

  let { score, label }: Props = $props();

  let percentage = $derived(Math.round(score * 100));

  let gaugeColor = $derived(
    percentage >= 80 ? 'var(--mtp-success)' :
    percentage >= 50 ? 'var(--mtp-warning)' :
    'var(--mtp-danger)'
  );

  // SVG arc parameters
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle
  const cx = size / 2;
  const cy = size / 2 + 10;

  let dashOffset = $derived(circumference - (score * circumference));

  // Arc path: semicircle from left to right (180 degrees)
  let arcPath = $derived(
    `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`
  );
</script>

<div class="drift-gauge">
  <svg
    width={size}
    height={size * 0.7}
    viewBox="0 0 {size} {size * 0.7}"
    class="gauge-svg"
  >
    <!-- Background track -->
    <path
      d={arcPath}
      fill="none"
      stroke="var(--mtp-border)"
      stroke-width={strokeWidth}
      stroke-linecap="round"
    />
    <!-- Filled arc -->
    <path
      d={arcPath}
      fill="none"
      stroke={gaugeColor}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      class="gauge-fill"
    />
  </svg>

  <div class="gauge-value" style:color={gaugeColor}>
    {percentage}<span class="gauge-percent">%</span>
  </div>

  {#if label}
    <span class="gauge-label">{label}</span>
  {/if}
</div>

<style>
  .drift-gauge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    position: relative;
  }

  .gauge-svg {
    display: block;
  }

  .gauge-fill {
    transition: stroke-dashoffset 0.6s ease, stroke 0.3s ease;
  }

  .gauge-value {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
    margin-top: -28px;
  }

  .gauge-percent {
    font-size: 16px;
    font-weight: 600;
  }

  .gauge-label {
    font-size: 12px;
    color: var(--mtp-text-secondary);
    font-weight: 500;
    margin-top: 2px;
  }
</style>
