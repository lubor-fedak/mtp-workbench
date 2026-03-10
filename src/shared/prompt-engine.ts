// ============================================================
// Prompt Composition Engine
// ============================================================

import type { ContextSnippet, MethodologyPackage, Platform } from './types';
import { getPlatformConfig, getPlatformName } from './platforms';

export interface ComposeOptions {
  project_name: string;
  snippets: ContextSnippet[];
  packages: MethodologyPackage[];
  dead_ends: string[];
  instruction?: string;
  target_platform: Platform;
}

export function composePrompt(options: ComposeOptions): string {
  const sections: string[] = [];
  const platformName = getPlatformName(options.target_platform);

  // Header
  sections.push(
    `You are executing a validated methodology from the project "${options.project_name}".`,
  );
  sections.push('Follow each step precisely. Report any deviations from the methodology.\n');

  // Context snippets
  if (options.snippets.length > 0) {
    sections.push('## Context\n');
    for (const snippet of options.snippets) {
      sections.push(`### ${snippet.title}\n${snippet.content}\n`);
    }
  }

  // Methodology packages
  if (options.packages.length > 0) {
    sections.push('## Methodology\n');
    for (const pkg of options.packages) {
      sections.push(`### ${pkg.display_name}\n`);
      sections.push(`${pkg.summary}\n`);

      // Render steps from MTP package if available
      const steps = extractSteps(pkg.mtp_package);
      if (steps.length > 0) {
        sections.push('**Steps:**');
        steps.forEach((step, i) => {
          sections.push(`${i + 1}. ${step}`);
        });
        sections.push('');
      }
    }
  }

  // Dead ends
  if (options.dead_ends.length > 0) {
    sections.push('## Known Dead Ends (Avoid These)\n');
    for (const de of options.dead_ends) {
      sections.push(`- ${de}`);
    }
    sections.push('');
  }

  // Instruction layer
  if (options.instruction) {
    sections.push(`## Task\n${options.instruction}\n`);
  }

  // Platform-specific footer
  const config = getPlatformConfig(options.target_platform);
  if (config) {
    sections.push(
      `---\n*Composed for ${platformName}. Report execution status for each step: success, partial, deviation, or failure.*`,
    );
  }

  return sections.join('\n');
}

function extractSteps(mtpPackage: Record<string, unknown>): string[] {
  try {
    const methodology = mtpPackage?.methodology as Record<string, unknown> | undefined;
    if (!methodology?.steps) return [];

    const steps = methodology.steps as Array<Record<string, unknown>>;
    return steps.map(
      (s) => `${s.name || s.title || 'Step'}: ${s.description || s.instruction || ''}`,
    );
  } catch {
    return [];
  }
}

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

export function checkContextLimit(prompt: string, platform: Platform): boolean {
  const config = getPlatformConfig(platform);
  if (!config) return true;

  const tokens = estimateTokens(prompt);
  // Leave 25% headroom for response
  return tokens < config.maxContextTokens * 0.75;
}
