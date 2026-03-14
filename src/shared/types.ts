// ============================================================
// MTP Workbench — Core Type Definitions
// ============================================================

// --- Platform & Execution ---

export type Platform = 'claude' | 'chatgpt' | 'gemini' | 'copilot' | 'other';

export type ExecutionStatus =
  | 'success'
  | 'partial'
  | 'deviation'
  | 'failure'
  | 'skipped'
  | 'escalated';

// --- Appearance ---

export interface ProjectAppearance {
  icon: string;
  icon_type: 'lucide' | 'emoji';
  color: string;
  avatar?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemeFont = 'system' | 'inter' | 'jetbrains-mono' | 'ibm-plex-sans';
export type ThemeDensity = 'compact' | 'default' | 'relaxed';

export interface GlobalTheme {
  mode: ThemeMode;
  accent: string;
  font: ThemeFont;
  density: ThemeDensity;
  sidebar_width: number;
}

// --- Code Block ---

export interface CodeBlock {
  code: string;
  language: string;
  filename?: string;
}

export type SnippetContentType = 'text' | 'code';

// --- Core Data ---

export interface Project {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  appearance: ProjectAppearance;
  created_at: string;
  updated_at: string;
  sort_order: number;
}

export interface ContextSnippet {
  id: string;
  project_id: string;
  title: string;
  content: string;
  content_type: SnippetContentType;
  language?: string;
  filename?: string;
  source_platform: Platform;
  source_url?: string;
  tags: string[];
  created_at: string;
}

export interface MethodologyPackage {
  id: string;
  project_id: string;
  display_name: string;
  summary: string;
  step_count: number;
  edge_case_count: number;
  dead_end_count: number;
  mtp_package: Record<string, unknown>;
  source_platform: Platform;
  created_at: string;
}

export interface ExecutionRecord {
  id: string;
  project_id: string;
  package_id: string;
  target_platform: Platform;
  drift_score: number;
  drift_components: DriftComponents;
  overall_status: ExecutionStatus;
  notes?: string;
  mtp_report: Record<string, unknown>;
  executed_at: string;
}

export interface DriftComponents {
  step_fidelity: number;
  deviation_rate: number;
  validation_pass_rate: number;
  output_quality: number;
  edge_case_coverage: number;
  novel_situation_rate: number;
  dead_end_avoidance: number;
}

// --- Export / Import ---

export interface ProjectExport {
  mtp_workbench_version: string;
  exported_at: string;
  project: Project;
  snippets: ContextSnippet[];
  packages: MethodologyPackage[];
  records: ExecutionRecord[];
}

export interface BulkExport {
  mtp_workbench_version: string;
  exported_at: string;
  projects: ProjectExport[];
}

// --- Messaging ---

export type MessageType =
  | 'GET_PROJECTS'
  | 'CREATE_PROJECT'
  | 'UPDATE_PROJECT'
  | 'DELETE_PROJECT'
  | 'GET_SNIPPETS'
  | 'CREATE_SNIPPET'
  | 'UPDATE_SNIPPET'
  | 'DELETE_SNIPPET'
  | 'GET_PACKAGES'
  | 'CREATE_PACKAGE'
  | 'DELETE_PACKAGE'
  | 'GET_RECORDS'
  | 'CREATE_RECORD'
  | 'GET_THEME'
  | 'SET_THEME'
  | 'EXPORT_PROJECT'
  | 'EXPORT_ALL_PROJECTS'
  | 'IMPORT_PROJECT'
  | 'CAPTURE_SELECTION'
  | 'CAPTURED_TEXT'
  | 'CAPTURED_CODE_BLOCK'
  | 'EXTRACT_CONVERSATION'
  | 'EXTRACT_CODE_BLOCKS'
  | 'INJECT_PROMPT';

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Sidebar Navigation ---

export type SidebarView =
  | 'projects'
  | 'project-detail'
  | 'compose'
  | 'capture'
  | 'capture-code'
  | 'drift'
  | 'settings';
