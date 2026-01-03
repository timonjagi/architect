# Product Requirements Document: Project Architect

**Version:** 1.0  
**Status:** Approved  
**Owner:** Senior Frontend Engineering Team  

---

## 1. Executive Summary
**Architect** is a high-fidelity system design and prompt optimization platform for software engineers. It bridges the gap between vague product ideas and actionable technical specifications by providing a structured, blueprint-based interface to configure modern web applications. The tool generates comprehensive architectural specs, implementation roadmaps, and directory structures, ensuring that AI-driven development is grounded in senior-level engineering principles.

---

## 2. Problem Statement
Developers frequently struggle with "Prompt Drift"—where vague instructions to AI models result in generic, non-scalable, or architecturally unsound code. There is a lack of tools that allow for granular configuration of tech stacks, functional modules (like RBAC, Booking, or RAG), and project context before generation occurs.

---

## 3. Target Audience
- **Senior Engineers/Architects:** Looking to quickly scaffold complex system documentation.
- **Freelancers:** Who need to provide professional PRDs and technical specs to clients.
- **Product Managers:** With technical backgrounds who want to define precise requirements for engineering teams.
- **Start-up Founders:** Validating technical feasibility before hiring a team.

---

## 4. Functional Requirements

### 4.1. Blueprint Configuration System
- **Category Filtering:** Users browse modules by category (SaaS, E-commerce, Booking, Social, AI, etc.).
- **Sub-module Selection:** Each blueprint (e.g., "Booking Logic") offers granular sub-capabilities (e.g., "Slot Generation," "Timezone Support").
- **Visual Feedback:** Active modules are highlighted with distinct badges and icons for clear architectural visibility.

### 4.2. Tech Stack Definition
- **Selection Matrix:** Define the Framework, Styling, Backend, Tooling, Notifications, and Payments.
- **Validation:** The AI engine respects the constraints of the chosen stack (e.g., using Supabase RLS policies if Supabase is selected).

### 4.3. Project Context (Knowledge Base)
- **File Uploads:** Support for uploading existing schemas, PRDs, or code snippets.
- **Paste Context:** A "Paste Text" modal for manual entry of documentation.
- **Persistence:** All sources are saved to a Supabase backend and associated with the project ID.

### 4.4. AI-Driven Specification Generation
- **Output Artifacts:**
    - **Cold Start Guide:** Immediate setup instructions.
    - **Implementation Plan:** Atomic, prioritized task lists with test strategies.
    - **Architecture Notes:** Boundary constraints and logic flow.
    - **Directory Structure:** ASCII representation of the proposed project tree.
- **Streaming UI:** Reassuring visual state during high-latency AI operations using Gemini-3-Pro-Preview.

### 4.5. Persistence & History (Supabase Backend)
- **Project Vault:** A sidebar to browse, load, and manage previous generations.
- **Persistence Logic:** Both the project configuration (sources, context) and the artifacts (generated specs) are persisted to Supabase after each generation.
- **Naming:** Users can rename projects for better organization.

### 4.6. Export Capabilities
- **Markdown Copy:** One-click copy for the full generated specification.
- **ZIP Bundle:** Generate a structured `.zip` containing the full spec (as Markdown files), source context, and implementation plans using `JSZip`.

---

## 5. Non-Functional Requirements
- **Performance:** Low-latency UI even with large context uploads.
- **Aesthetics:** "High-Tech Dark Mode" using Tailwind CSS, Inter for UI, and Fira Code for technical data.
- **Security:** API key safety; no credentials stored in client-side code (environment variable access only).
- **Scalability:** Blueprint system designed for easy addition of new industry-specific modules.

---

## 6. Technical Architecture
- **AI Model:** `gemini-3-flash-preview` for complex reasoning.
- **Frontend:** NextJS, Tailwind CSS.
- **Persistence:** Supabase (PostgreSQL) for storing projects, sources, and artifacts.
- **Bundling:** JSZip for client-side archive generation of Markdown artifacts.
- **Icons:** Lucide-React.

---

## 7. Database Schema

### projects table
Stores both draft and published projects with their configuration.
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- name: VARCHAR (required)
- description: TEXT
- status: ENUM (draft, published) 
- blueprint_config: JSONB -- Stores selected blueprints with sub-modules
- raw_prompt: TEXT -- Stores user's raw requirement input
- framework: VARCHAR
- styling: VARCHAR
- backend: VARCHAR
- notifications: JSONB
- payments: VARCHAR
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### specs table
Versioned specifications generated from projects.
```sql
- id: UUID (primary key)
- project_id: UUID (foreign key to projects)
- version: VARCHAR (semver format: 1.0.0) -- uses semver
- title: VARCHAR
- cold_start_guide: TEXT
- directory_structure: JSONB
- framework_details: JSONB
- styling_details: JSONB
- backend_details: JSONB
- implementation_plan: JSONB
- tasks: JSONB -- (array of task objects )
- created_at: TIMESTAMP
- published_at: TIMESTAMP
```

### project_sources table
Stores uploaded project documentation and reference materials.
```sql
- id: UUID (primary key)
- project_id: UUID (foreign key to projects)
- file_name: VARCHAR
- file_type: VARCHAR (pdf, markdown, text)
- content: TEXT
- size: INTEGER (bytes)
- uploaded_at: TIMESTAMP
```

## Data Model

### Draft Workflow
1. User creates a **project** with `status: 'draft'`
2. User adds **blueprint_config** with selected blueprints and sub-modules
3. User uploads **context_files** (optional)
4. User enters **raw_prompt** with requirements
5. Auto-save persists draft state
6. User generates specification
6. System creates new **spec** with `version: '1.0.0'`
7. Subsequent generations increment version (1.0.1, 1.1.0, 2.0.0)

## API Endpoints

### GET /api/projects
Fetch all projects (draft and published) for user

### POST /api/projects
Create new project

### GET /api/projects/[id]
Fetch specific project

### GET /api/projects/[id]/specs
Fetch all specs for a project

### POST /api/projects/[id]/sources
Upload project documentation and reference materials

### GET /api/projects/[id]/sources
Fetch all sources for a project

### PATCH /api/projects/[id]
Auto-save updates to draft project (blueprint_config, raw_prompt, context_files)

### POST /api/projects/[id]/generate
Generates specification → creates new spec with incremented semver

### GET /api/project_specs?project_id=[id]
Fetch all specs for a project

### GET /api/project_specs/[id]
Fetch specific spec version

### PATCH /api/project_specs/[id]
Update spec version

### DELETE /api/project_specs/[id]
Delete spec version


## 8. Success Metrics
- **Prompt Reduction:** Users spend 80% less time refining LLM prompts for scaffolding.
- **Code Quality:** 50% increase in "first-pass" architectural correctness.
- **Export Utility:** 100% of generated specs are compatible with standard IDE project structures.


## 9. Future Roadmap
- **Live Sync:**  Real-time collaboration on blueprints.
- **CLI Tool:**  An architect-cli to pull specs directly into a local terminal.
- **Model**  Switching: Support for selecting between Flash (fast) and Pro (detailed) models.
- **Custom Blueprints** : Allow users to save their own reusable module templates.