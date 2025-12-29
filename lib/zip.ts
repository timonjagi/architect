import JSZip from 'jszip';
import { OptimizationResult, Source } from './types';

/**
 * Packs the generated specification and project sources into a structured ZIP file.
 */
export const exportProjectBundle = async (
  projectName: string,
  result: OptimizationResult,
  sources: Source[]
) => {
  const zip = new JSZip();
  const folder = zip.folder(projectName.replace(/\s+/g, '-').toLowerCase());

  if (!folder) throw new Error("Failed to create ZIP folder.");

  // Add the main specification
  folder.file("FULL_SPECIFICATION.md", result.fullMarkdownSpec);
  folder.file("COLD_START_GUIDE.md", result.coldStartGuide);
  folder.file("ARCHITECTURE_NOTES.md", result.architectureNotes);
  folder.file("DIRECTORY_STRUCTURE.txt", result.directoryStructure);

  // Add Implementation Plan as a formatted markdown
  const planMd = result.implementationPlan.map(task => `
# [${task.id}] ${task.title}
**Priority:** ${task.priority.toUpperCase()}
**Files:** ${task.files_involved.join(', ')}

## Description
${task.description}

## Implementation Details
${task.details}

## Test Strategy
${task.testStrategy}

---
`).join('\n');
  folder.file("IMPLEMENTATION_PLAN.md", planMd);

  // Add Project Sources
  if (sources.length > 0) {
    const sourcesFolder = folder.folder("context_sources");
    if (sourcesFolder) {
      sources.forEach(src => {
        sourcesFolder.file(src.name, src.content);
      });
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName.replace(/\s+/g, '_')}_bundle.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
