import { pgTable, uuid, text, timestamp, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const projectStatusEnum = pgEnum("project_status", ["draft", "published"]);
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "blocked", "done"]);
export const taskPriorityEnum = pgEnum("task_priority", ["p0", "p1", "p2", "p3"]);
export const blockerTypeEnum = pgEnum("blocker_type", ["technical", "scope", "dependency", "external"]);
export const executionModeEnum = pgEnum("execution_mode", ["simple", "advanced"]);
export const activityEventEnum = pgEnum("activity_event", ["created", "status_changed", "blocked", "unblocked", "assigned", "commented"]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("draft").notNull(),
  blueprintConfig: jsonb("blueprint_config"),
  rawPrompt: text("raw_prompt"),
  framework: text("framework"),
  styling: text("styling"),
  backend: text("backend"),
  stateManagement: text("state_management"),
  notifications: jsonb("notifications"),
  payments: text("payments"),
  currentExecutionMode: executionModeEnum("current_execution_mode").default("simple"),
  executionSettings: jsonb("execution_settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectSpecs = pgTable("project_specs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  coldStartGuide: text("cold_start_guide"),
  directoryStructure: text("directory_structure"),
  frameworkDetails: jsonb("framework_details"),
  stylingDetails: jsonb("styling_details"),
  backendDetails: jsonb("backend_details"),
  implementationPlan: jsonb("implementation_plan"),
  tasks: jsonb("tasks"),
  architectureNotes: text("architecture_notes"),
  fullMarkdownSpec: text("full_markdown_spec"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

export const projectSources = pgTable("project_sources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // pdf, markdown, text
  content: text("content"),
  size: integer("size"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const projectTasks = pgTable("project_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  specId: uuid("spec_id").references(() => projectSpecs.id, { onDelete: "set null" }),
  epicId: text("epic_id"),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("todo").notNull(),
  priority: taskPriorityEnum("priority").default("p1").notNull(),
  estimateMinutes: integer("estimate_minutes"),
  actualMinutes: integer("actual_minutes"),
  assigneeId: uuid("assignee_id"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskDependencies = pgTable("task_dependencies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid("task_id").references(() => projectTasks.id, { onDelete: "cascade" }).notNull(),
  dependsOnTaskId: uuid("depends_on_task_id").references(() => projectTasks.id, { onDelete: "cascade" }).notNull(),
  dependencyType: text("dependency_type").default("blocks"),
});

export const taskBlockers = pgTable("task_blockers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid("task_id").references(() => projectTasks.id, { onDelete: "cascade" }).notNull(),
  type: blockerTypeEnum("type").notNull(),
  details: text("details"),
  createdBy: uuid("created_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskActivity = pgTable("task_activity", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid("task_id").references(() => projectTasks.id, { onDelete: "cascade" }).notNull(),
  actorId: uuid("actor_id"),
  eventType: activityEventEnum("event_type").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const executionSnapshots = pgTable("execution_snapshots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  velocity: integer("velocity"),
  blockedCount: integer("blocked_count"),
  totalTasks: integer("total_tasks"),
  completedTasks: integer("completed_tasks"),
  predictabilityScore: integer("predictability_score"),
});
