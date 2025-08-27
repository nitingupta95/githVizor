import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from 'usehooks-ts';

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();

  // FIX 1: Add <string | null> to tell TypeScript the possible types
  const [projectId, setProjectId] = useLocalStorage<string | null>('githubSaas', null);

  // FIX 2: Remove the incorrect type annotation. TypeScript can now infer it correctly.
  const project = projects?.find((project) => project.id === projectId);

  return {
    projects,
    project,
    projectId,
    setProjectId
  };
};

export default useProject;