import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Project, ProjectSpec, Source } from "../types";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}

export function useProject(id: string | null) {
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: async () => {
      if (!id) return null as any;
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: (data: Project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", data.id] });
    },
  });
}

export function useSources(projectId: string | null) {
  return useQuery<Source[]>({
    queryKey: ["projects", projectId, "sources"],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/projects/${projectId}/sources`);
      if (!res.ok) throw new Error("Failed to fetch sources");
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useAddSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, source }: { projectId: string; source: Omit<Source, "id"> }) => {
      const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: source.name,
          fileType: source.type,
          content: source.content,
          size: 0, // Should be calculated
        }),
      });
      if (!res.ok) throw new Error("Failed to add source");
      return res.json();
    },
    onSuccess: (data: any, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "sources"] });
    },
  });
}

export function useProjectSpecs(projectId: string | null) {
  return useQuery({
    queryKey: ["projects", projectId, "specs"],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (!res.ok) throw new Error("Failed to fetch specs");
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useGenerateSpec() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate spec");
      return res.json();
    },
    onSuccess: (data: any, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "specs"] });
    },
  });
}
