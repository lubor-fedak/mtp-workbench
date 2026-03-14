// ============================================================
// IndexedDB Storage Layer — Dexie.js
// ============================================================

import Dexie, { type EntityTable } from 'dexie';
import type {
  ContextSnippet,
  ExecutionRecord,
  GlobalTheme,
  MethodologyPackage,
  Project,
} from '../shared/types';
import { DEFAULT_THEME } from '../shared/theme';

const DB_NAME = 'mtp-workbench';

class MtpDatabase extends Dexie {
  projects!: EntityTable<Project, 'id'>;
  snippets!: EntityTable<ContextSnippet, 'id'>;
  packages!: EntityTable<MethodologyPackage, 'id'>;
  records!: EntityTable<ExecutionRecord, 'id'>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      projects: 'id, name, sort_order, created_at, updated_at',
      snippets: 'id, project_id, title, source_platform, created_at',
      packages: 'id, project_id, display_name, source_platform, created_at',
      records: 'id, project_id, package_id, target_platform, executed_at',
    });

    this.version(2).stores({
      projects: 'id, name, sort_order, created_at, updated_at',
      snippets: 'id, project_id, title, content_type, source_platform, created_at',
      packages: 'id, project_id, display_name, source_platform, created_at',
      records: 'id, project_id, package_id, target_platform, executed_at',
    }).upgrade((tx) => {
      // Migrate existing snippets to have content_type = 'text'
      return tx.table('snippets').toCollection().modify((snippet) => {
        if (!snippet.content_type) {
          snippet.content_type = 'text';
        }
      });
    });
  }
}

export const db = new MtpDatabase();

// ---- Theme Storage (chrome.storage.local for sync across contexts) ----

const THEME_KEY = 'mtp_theme';

export async function getTheme(): Promise<GlobalTheme> {
  const result = await chrome.storage.local.get(THEME_KEY);
  return result[THEME_KEY] ?? { ...DEFAULT_THEME };
}

export async function setTheme(theme: GlobalTheme): Promise<void> {
  await chrome.storage.local.set({ [THEME_KEY]: theme });
}

// ---- Projects ----

export async function getProjects(): Promise<Project[]> {
  return db.projects.orderBy('sort_order').toArray();
}

export async function createProject(project: Project): Promise<Project> {
  await db.projects.add(project);
  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project | undefined> {
  await db.projects.update(id, { ...updates, updated_at: new Date().toISOString() });
  return db.projects.get(id);
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', [db.projects, db.snippets, db.packages, db.records], async () => {
    await db.snippets.where('project_id').equals(id).delete();
    await db.packages.where('project_id').equals(id).delete();
    await db.records.where('project_id').equals(id).delete();
    await db.projects.delete(id);
  });
}

// ---- Snippets ----

export async function getSnippets(projectId: string): Promise<ContextSnippet[]> {
  return db.snippets.where('project_id').equals(projectId).sortBy('created_at');
}

export async function createSnippet(snippet: ContextSnippet): Promise<ContextSnippet> {
  await db.snippets.add(snippet);
  return snippet;
}

export async function updateSnippet(
  id: string,
  updates: Partial<ContextSnippet>,
): Promise<ContextSnippet | undefined> {
  await db.snippets.update(id, updates);
  return db.snippets.get(id);
}

export async function deleteSnippet(id: string): Promise<void> {
  await db.snippets.delete(id);
}

// ---- Packages ----

export async function getPackages(projectId: string): Promise<MethodologyPackage[]> {
  return db.packages.where('project_id').equals(projectId).sortBy('created_at');
}

export async function createPackage(pkg: MethodologyPackage): Promise<MethodologyPackage> {
  await db.packages.add(pkg);
  return pkg;
}

export async function deletePackage(id: string): Promise<void> {
  await db.packages.delete(id);
}

// ---- Execution Records ----

export async function getRecords(projectId: string): Promise<ExecutionRecord[]> {
  return db.records.where('project_id').equals(projectId).sortBy('executed_at');
}

export async function createRecord(record: ExecutionRecord): Promise<ExecutionRecord> {
  await db.records.add(record);
  return record;
}

// ---- Search ----

export interface SearchResult {
  snippet: ContextSnippet;
  project_name: string;
  project_id: string;
  project_color: string;
}

export async function searchSnippets(query: string): Promise<SearchResult[]> {
  const q = query.toLowerCase();
  const allSnippets = await db.snippets.toArray();
  const allProjects = await db.projects.toArray();

  const projectMap = new Map(allProjects.map((p) => [p.id, p]));

  const results: SearchResult[] = [];
  for (const snippet of allSnippets) {
    const matchesTitle = snippet.title.toLowerCase().includes(q);
    const matchesContent = snippet.content.toLowerCase().includes(q);
    const matchesTags = snippet.tags.some((t) => t.toLowerCase().includes(q));
    const matchesFilename = snippet.filename?.toLowerCase().includes(q);
    const matchesLanguage = snippet.language?.toLowerCase().includes(q);

    if (matchesTitle || matchesContent || matchesTags || matchesFilename || matchesLanguage) {
      const project = projectMap.get(snippet.project_id);
      results.push({
        snippet,
        project_name: project?.name ?? 'Unknown',
        project_id: snippet.project_id,
        project_color: project?.appearance.color ?? '#6366f1',
      });
    }
  }

  return results;
}
