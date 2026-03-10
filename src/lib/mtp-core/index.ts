// ============================================================
// MTP Core — Protocol Logic (Phase 1: Stubs)
// ============================================================
//
// Full implementation in Phase 2-3. This module will contain:
// - mtp-extract: Extract methodology packages from conversations
// - mtp-lint: Validate MTP packages against schema
// - drift-calc: Calculate drift scores from execution reports
//
// For Phase 1, these are placeholder functions that establish
// the interface for future implementation.

import type { DriftComponents, ExecutionStatus, MethodologyPackage } from '../../shared/types';

/**
 * Extract an MTP package from raw conversation text.
 * Phase 2: Will implement full extraction logic ported from Python.
 */
export function extractPackage(
  conversationText: string,
  _sourcePlatform: string,
): Partial<MethodologyPackage> {
  // Phase 1: Create a basic package shell from the text
  const lines = conversationText.split('\n').filter((l) => l.trim());
  const title = lines[0]?.substring(0, 100) || 'Untitled Package';

  return {
    display_name: title,
    summary: lines.slice(0, 3).join(' ').substring(0, 300),
    step_count: 0,
    edge_case_count: 0,
    dead_end_count: 0,
    mtp_package: {
      mtp_version: '0.2',
      metadata: {
        name: title,
        description: lines.slice(0, 3).join(' ').substring(0, 300),
      },
      methodology: {
        steps: [],
        edge_cases: [],
        dead_ends: [],
      },
    },
  };
}

/**
 * Validate an MTP package against the v0.2 schema.
 * Phase 2: Will use Ajv with actual MTP schemas.
 */
export function validatePackage(
  _mtpPackage: Record<string, unknown>,
): { valid: boolean; errors: string[] } {
  // Phase 1: Always valid (no schema validation yet)
  return { valid: true, errors: [] };
}

/**
 * Calculate drift score from execution results.
 * Phase 3: Will implement full 7-component drift calculation.
 */
export function calculateDrift(
  _expected: Record<string, unknown>,
  _actual: Record<string, unknown>,
): { score: number; components: DriftComponents; status: ExecutionStatus } {
  // Phase 1: Placeholder
  return {
    score: 1.0,
    components: {
      step_fidelity: 1.0,
      deviation_rate: 0.0,
      validation_pass_rate: 1.0,
      output_quality: 1.0,
      edge_case_coverage: 1.0,
      novel_situation_rate: 0.0,
      dead_end_avoidance: 1.0,
    },
    status: 'success',
  };
}
