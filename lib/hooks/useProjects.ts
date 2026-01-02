import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project, ProjectSpec, Source } from "../types";
import { createClient } from "../supabase/client";
import { optimizePrompt } from "../ai";
import { PromptConfig } from "../types";

const mapProject = (p: any): Project => ({
  id: p.id,
  name: p.name,
  description: p.description,
  framework: p.framework,
  styling: p.styling,
  backend: p.backend,
  notifications: p.notifications,
  payments: p.payments,
  rawPrompt: p.raw_prompt,
  blueprintConfig: p.blueprint_config,
  createdAt: p.created_at,
});

const mapSource = (s: any): Source => ({
  id: s.id,
  name: s.file_name,
  content: s.content,
  type: s.file_type,
});

const mapProjectSpec = (s: any): ProjectSpec => ({
  id: s.id,
  projectId: s.project_id,
  coldStartGuide: s.cold_start_guide,
  tasks: s.tasks || [],
  implementationPlan: s.implementation_plan || {},
  directoryStructure: s.directory_structure || "",
  architectureNotes: s.architecture_notes || "",
  fullMarkdownSpec: s.full_markdown_spec || "",
  createdAt: s.created_at,
  version: s.version,
});

export function useProjects() {
  const supabase = createClient();
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapProject);
    },
  });
}

export function useProject(id: string | null) {
  const supabase = createClient();
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: async () => {
      if (!id) return null as any;
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return mapProject(data);
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await supabase
        .from("projects")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return mapProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      // Map camelCase to snake_case for the database
      const updateData: any = { ...data };
      if (data.rawPrompt !== undefined) {
        updateData.raw_prompt = data.rawPrompt;
        delete updateData.rawPrompt;
      }
      if (data.blueprintConfig !== undefined) {
        updateData.blueprint_config = data.blueprintConfig;
        delete updateData.blueprintConfig;
      }

      const { data: updated, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return mapProject(updated);
    },
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
    },
  });
}

export function useSources(projectId: string | null) {
  const supabase = createClient();
  return useQuery<Source[]>({
    queryKey: ["projects", projectId, "sources"],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("project_sources")
        .select("*")
        .eq("project_id", projectId);

      if (error) throw error;
      return (data || []).map(mapSource);
    },
    enabled: !!projectId,
  });
}

export function useAddSource() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ projectId, source }: { projectId: string; source: Omit<Source, "id"> }) => {
      const { data, error } = await supabase
        .from("project_sources")
        .insert({
          project_id: projectId,
          file_name: source.name,
          file_type: source.type,
          content: source.content,
          size: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return mapSource(data);
    },
    onSuccess: (data: any, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "sources"] });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  return useMutation({
    mutationFn: async ({ projectId, sourceId }: { projectId: string; sourceId: string }) => {
      const { error } = await supabase
        .from("project_sources")
        .delete()
        .eq("id", sourceId)
        .eq("project_id", projectId); // Extra safety

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (data: any, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "sources"] });
    },
  });
}

export function useProjectSpecs(projectId: string | null) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["projects", projectId, "specs"],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("project_specs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(mapProjectSpec);
    },
    enabled: !!projectId,
  });
}

export function useGenerateSpec() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // 1. Fetch project and sources for context
      const { data: project, error: pError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (pError) throw pError;

      const { data: sources, error: sError } = await supabase
        .from("project_sources")
        .select("*")
        .eq("project_id", projectId);

      if (sError) throw sError;

      const mappedProject = mapProject(project);
      const mappedSources = (sources || []).map(mapSource);

      // 2. Prepare config for Gemini
      const config: PromptConfig = {
        framework: mappedProject.framework as any,
        styling: mappedProject.styling as any,
        backend: mappedProject.backend as any,
        tooling: [], // Currently not stored explicitly in snake_case mapping but can be extracted if needed
        providers: (mappedProject.notifications as any) || [],
        payments: [mappedProject.payments as any],
        sources: mappedSources,
        selectedBlueprints: mappedProject.blueprintConfig?.selectedBlueprints || [],
        customContext: mappedProject.rawPrompt || ""
      };

      console.log(config);

      // 3. Generate spec using Gemini SDK client-side
      const result = await optimizePrompt(mappedProject.rawPrompt || "Generate spec", config);

      // Determine version
      const { data: existingSpecs } = await supabase.from("project_specs").select("version").eq("project_id", projectId);
      const versionCount = existingSpecs?.length || 0;
      const nextVersion = `1.0.${versionCount}`;

      // 4. Save to project_specs via Supabase
      const { data: newSpec, error: insertError } = await supabase
        .from("project_specs")
        .insert({
          project_id: projectId,
          version: nextVersion,
          title: mappedProject.name + " Spec",
          cold_start_guide: result.coldStartGuide,
          directory_structure: result.directoryStructure,
          implementation_plan: { plan: result.implementationPlan },
          tasks: result.implementationPlan,
          architecture_notes: result.architectureNotes,
          full_markdown_spec: result.fullMarkdownSpec
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return mapProjectSpec(newSpec);
    },
    onSuccess: (data: any, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "specs"] });
    },
  });
}
