
export type Framework = 'React' | 'Next.js' | 'Vue 3' | 'SvelteKit' | 'Astro';
export type Styling = 'Tailwind CSS' | 'Shadcn/UI' | 'Chakra UI' | 'Styled Components' | 'CSS Modules';
export type Backend = 'Supabase' | 'Appwrite' | 'Pocketbase' | 'PostgreSQL' | 'N8N (Workflows)';
export type Tooling = 'TypeScript' | 'Zod' | 'React Hook Form' | 'Prisma' | 'Drizzle';
export type NotificationProvider = 'Novu (In-App/Infra)' | 'OneSignal (Push)' | 'Twilio (SMS)' | 'Resend (Email)';

export interface Source {
  id: string;
  name: string;
  content: string;
  type: string;
}

export interface PromptConfig {
  framework: Framework;
  styling: Styling;
  backend: Backend;
  tooling: Tooling[];
  providers: NotificationProvider[];
  customContext?: string;
  sources: Source[];
}

export interface OptimizationResult {
  optimizedPrompt: string;
  architectureNotes: string;
  suggestedStack: string;
}
