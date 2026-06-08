
export type Framework = 'React' | 'Next.js' | 'Vue 3' | 'SvelteKit' | 'Astro';
export type Styling = 'Tailwind CSS' | 'Shadcn/UI' | 'Chakra UI' | 'Styled Components' | 'CSS Modules';
export type Backend = 'Supabase' | 'Appwrite' | 'Pocketbase' | 'PostgreSQL' | 'N8N (Workflows)';
export type Tooling = 'TypeScript' | 'Zod' | 'React Hook Form' | 'Prisma' | 'Drizzle';
export type NotificationProvider = 'Novu (In-App/Infra)' | 'OneSignal (Push)' | 'Twilio (SMS)' | 'Resend (Email)';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'p0' | 'p1' | 'p2' | 'p3';
export type BlockerType = 'technical' | 'scope' | 'dependency' | 'external';
export type ExecutionMode = 'simple' | 'advanced';
export type ActivityEvent = 'created' | 'status_changed' | 'blocked' | 'unblocked' | 'assigned' | 'commented';

export interface Source {
  id: string;
  name: string;
  content: string;
  type: string;
}

export interface SelectedBlueprint {
  blueprintId: string;
  name: string;
  selectedSubLabels: string[];
}

export interface PromptConfig {
  framework: Framework;
  styling: Styling;
  backend: Backend;
  tooling: Tooling[];
  providers: NotificationProvider[];
  customContext?: string;
  sources: Source[];
  selectedBlueprints?: SelectedBlueprint[];
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  details: string;
  testStrategy: string;
  priority: 'high' | 'medium' | 'low';
  files_involved: string[];
  dependencies: string[];
}

export interface OptimizationResult {
  coldStartGuide: string;
  directoryStructure: string;
  implementationPlan: TaskItem[];
  architectureNotes: string;
  fullMarkdownSpec: string;
}

export interface ExecutionTask {
  id: string;
  projectId: string;
  specId: string | null;
  epicId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimateMinutes: number | null;
  actualMinutes: number | null;
  assigneeId: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependencyType: string;
}

export interface TaskBlocker {
  id: string;
  taskId: string;
  type: BlockerType;
  details: string | null;
  createdBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  actorId: string | null;
  eventType: ActivityEvent;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface ExecutionSnapshot {
  id: string;
  projectId: string;
  snapshotDate: Date;
  velocity: number | null;
  blockedCount: number | null;
  totalTasks: number | null;
  completedTasks: number | null;
  predictabilityScore: number | null;
}

export interface ExecutionSettings {
  autoImport: boolean;
  defaultPriority: TaskPriority;
  focusCount: number;
}
