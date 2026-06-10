# Architect

System design and prompt optimization platform for software engineers. Converts rough product ideas into actionable technical specifications, implementation roadmaps, and directory structures.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS
- **Backend**: Supabase (auth + database)
- **Database**: Drizzle ORM
- **AI**: Google Gemini API
- **State**: React Query (TanStack)

## Getting Started

```bash
bun install
```

Set your Gemini API key in `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key
```

```bash
bun run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run database migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:studio` | Open Drizzle Studio |

## Architecture

```
architect/
├── app/
│   ├── components/      # LandingView, DashboardView
│   ├── dashboard/       # Dashboard page
│   ├── login/           # Login page + actions
│   ├── signup/          # Signup page
│   └── auth/callback/   # Auth callback route
├── drizzle/             # Database migrations
├── lib/                 # Utilities (Supabase client, etc.)
├── services/            # API service layer
├── docs/                # Execution plans & backlog
├── types.ts             # Core type definitions
├── middleware.ts         # Route middleware
└── PRD.md               # Product requirements document
```

## Features

- **Blueprint Configuration**: Browse and select functional modules by category (SaaS, E-commerce, Booking, Social, AI)
- **Tech Stack Selection**: Define framework, styling, backend, tooling, and notification providers
- **Knowledge Base**: Upload schemas, PRDs, or paste context for AI grounding
- **AI Spec Generation**: Generates cold start guides, implementation plans, architecture notes, and directory structures via Gemini
- **Project Management**: Persistent project/spec history with Supabase backend
- **Streaming UI**: Real-time feedback during AI generation

## Branch Notes

Current branch (`codex/create-improvement-plan-for-architect-borrowing`) includes an improvement plan to evolve Architect from a spec generator into an execution operating system with sprint flow, blocker handling, and review loops. See `IMPROVEMENT_PLAN.md` and `docs/` for details.
