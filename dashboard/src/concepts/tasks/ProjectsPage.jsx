import React from 'react';
import { Header } from '../../components/layout/Header';
import AgendaNav from '../../components/project-tasks/AgendaNav';
import ProjectsTab from '../../components/project-tasks/ProjectsTab';
import { useGetMyProjectsQuery } from '../../services/api/projectTasksApi';

export const ProjectsPage = () => {
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useGetMyProjectsQuery();
  return (
    <div className="min-h-screen bg-zinc-950" data-testid="projects-page">
      <Header title="Projects" subtitle="Manage your projects" />
      <div className="p-4 sm:p-6">
        <AgendaNav />
        <ProjectsTab projects={projects} isLoading={projectsLoading} error={projectsError} />
      </div>
    </div>
  );
};

export default ProjectsPage;
