// ============================================================
// Export / Import Logic
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type {
  ProjectExport,
  BulkExport,
  Project,
} from '../shared/types';
import {
  db,
  createProject,
  createSnippet,
  createPackage,
  createRecord,
} from './storage';

const VERSION = '0.1.0';

/**
 * Export a single project with all its data.
 */
export async function exportProject(projectId: string): Promise<ProjectExport> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error(`Project not found: ${projectId}`);

  const [snippets, packages, records] = await Promise.all([
    db.snippets.where('project_id').equals(projectId).toArray(),
    db.packages.where('project_id').equals(projectId).toArray(),
    db.records.where('project_id').equals(projectId).toArray(),
  ]);

  return {
    mtp_workbench_version: VERSION,
    exported_at: new Date().toISOString(),
    project,
    snippets,
    packages,
    records,
  };
}

/**
 * Export all projects as a single bulk archive.
 */
export async function exportAllProjects(): Promise<BulkExport> {
  const allProjects = await db.projects.toArray();

  const projects: ProjectExport[] = await Promise.all(
    allProjects.map((p) => exportProject(p.id)),
  );

  return {
    mtp_workbench_version: VERSION,
    exported_at: new Date().toISOString(),
    projects,
  };
}

/**
 * Import a single project export. Generates new IDs to avoid collisions.
 */
export async function importProject(data: ProjectExport): Promise<Project> {
  const newProjectId = uuidv4();
  const now = new Date().toISOString();

  const project: Project = {
    ...data.project,
    id: newProjectId,
    created_at: data.project.created_at || now,
    updated_at: now,
  };

  await createProject(project);

  // Import snippets with new IDs
  for (const snippet of data.snippets) {
    await createSnippet({
      ...snippet,
      id: uuidv4(),
      project_id: newProjectId,
      // Ensure content_type exists for backward compatibility
      content_type: snippet.content_type || 'text',
    });
  }

  // Import packages with new IDs
  for (const pkg of data.packages) {
    await createPackage({
      ...pkg,
      id: uuidv4(),
      project_id: newProjectId,
    });
  }

  // Import execution records with new IDs
  for (const record of data.records) {
    await createRecord({
      ...record,
      id: uuidv4(),
      project_id: newProjectId,
      // Remap package_id is not feasible without a mapping table,
      // so we keep the original for reference
    });
  }

  return project;
}

/**
 * Import a bulk export (multiple projects).
 */
export async function importBulkExport(data: BulkExport): Promise<Project[]> {
  const imported: Project[] = [];
  for (const projectExport of data.projects) {
    const project = await importProject(projectExport);
    imported.push(project);
  }
  return imported;
}
