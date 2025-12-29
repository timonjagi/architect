
## Database Schema

The Architect module uses a simplified schema that integrates seamlessly with the agent network:

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
- context_files: JSONB -- Array of uploaded context file references
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
- tasks: JSONB (array of task objects for agent_missions)
- created_at: TIMESTAMP
- published_at: TIMESTAMP
```

### project_context table
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
5. Auto-save persists draft state to database
6. User generates specification
6. System creates new **spec** with `version: '1.0.0'`
7. Subsequent generations increment version (1.0.1, 1.1.0, 2.0.0)

## API Endpoints

### GET /api/projects
Fetch all projects (draft and published) for user

### POST /api/projects
Create new project

### PATCH /api/projects/[id]
Auto-save updates to draft project (blueprint_config, raw_prompt, context_files)

### POST /api/projects/[id]/generate
Generates specification → creates new spec with incremented semver

### GET /api/specs
Fetch all specs for a project

### GET /api/specs/[id]
Fetch specific spec version

