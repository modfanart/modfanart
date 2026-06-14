import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Folder, CheckSquare } from '@phosphor-icons/react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// RTK Query Hooks
import {
  useGetMyProjectsQuery,
  useGetMyTasksQuery,
  useCreateProjectMutation,
} from '../../services/api/projectTasksApi';
import ProjectsTab from '../../components/project-tasks/ProjectsTab';
import TasksTab from '../../components/project-tasks/TasksTab';

export const ProjectsTasksList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');

  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useGetMyProjectsQuery();

  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useGetMyTasksQuery();

  return (
    <div className="min-h-screen bg-zinc-950" data-testid="projects-tasks-page">
      <Header 
        title="Workspace" 
        subtitle="Manage your projects and tasks" 
      />

      <div className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 mb-6">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              My Tasks
            </TabsTrigger>
          </TabsList>

          {/* PROJECTS TAB */}
          <TabsContent value="projects">
            <ProjectsTab 
              projects={projects} 
              isLoading={projectsLoading} 
              error={projectsError}
            />
          </TabsContent>

          {/* TASKS TAB */}
          <TabsContent value="tasks">
            <TasksTab 
              tasks={tasks} 
              isLoading={tasksLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectsTasksList;