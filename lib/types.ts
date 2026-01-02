export type Framework = 'React' | 'Next.js' | 'Vue 3' | 'SvelteKit' | 'Astro';
export type Styling = 'Tailwind CSS' | 'Shadcn/UI' | 'Chakra UI' | 'Styled Components' | 'CSS Modules';
export type Backend = 'Supabase' | 'Appwrite' | 'Pocketbase' | 'PostgreSQL' | 'N8N (Workflows)';
export type Tooling = 'TypeScript' | 'Zod' | 'React Hook Form' | 'Prisma' | 'Drizzle';
export type NotificationProvider = 'Novu (In-App/Infra)' | 'OneSignal (Push)' | 'Twilio (SMS)' | 'Resend (Email)';
export type PaymentProvider = 'Stripe' | 'LemonSqueezy' | 'Paddle' | 'PayPal';

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
  payments: PaymentProvider[];
  customContext?: string;
  sources: Source[];
  selectedBlueprints?: SelectedBlueprint[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  framework: string | null;
  styling: string | null;
  backend: string | null;
  notifications: string[] | null;
  payments: string | null;
  rawPrompt: string | null;
  blueprintConfig: any;
  createdAt: string;
}

export interface ProjectSpec {
  id: string;
  projectId: string;
  coldStartGuide: string;
  tasks: TaskItem[];
  implementationPlan: any;
  directoryStructure: any;
  createdAt: string;
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