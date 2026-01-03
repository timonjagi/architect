ALTER TABLE "project_specs" ALTER COLUMN "directory_structure" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "state_management" text;