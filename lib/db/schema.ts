import { pgTable, uuid, text, timestamp, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const projectStatusEnum = pgEnum("project_status", ["draft", "published"]);

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
  notifications: jsonb("notifications"),
  payments: text("payments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectSpecs = pgTable("project_specs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  coldStartGuide: text("cold_start_guide"),
  directoryStructure: jsonb("directory_structure"),
  frameworkDetails: jsonb("framework_details"),
  stylingDetails: jsonb("styling_details"),
  backendDetails: jsonb("backend_details"),
  implementationPlan: jsonb("implementation_plan"),
  tasks: jsonb("tasks"),
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
