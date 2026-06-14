import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckSquare, Users } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';

// RTK Query
import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
} from '../../services/api/projectTasksApi';

import TasksList from '../../components/project-tasks/TasksList'; // We'll create this if needed

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tasks');

  const {
    data: projectData,
    isLoading: projectLoading,
  } = useGetProjectByIdQuery(projectId);
const project = projectData?.data || projectData || {};
  const {
    data: tasksData = [],
    isLoading: tasksLoading,
  } = useGetProjectTasksQuery(projectId);

  const tasks = tasksData?.data || tasksData || [];

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-700 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header 
        title={project?.name || 'Project'} 
        subtitle={project?.description || ''}
        backButton
        onBack={() => navigate('/workspace')}
      />

      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {project?.memberCount || 0} Members
          </Badge>
          <Badge variant="outline">
            {tasks.length} Tasks
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* TASKS TAB */}
          <TabsContent value="tasks">
     

            <TasksList 
              tasks={tasks} 
              isLoading={tasksLoading} 
              projectId={projectId}
            />
          </TabsContent>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Project Overview</h3>
              <p className="text-zinc-400 leading-relaxed">
                {project?.description || 'No description provided.'}
              </p>
              {/* Add progress, stats, etc. here later */}
            </div>
          </TabsContent>

          {/* MEMBERS TAB (Placeholder) */}
          <TabsContent value="members">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-400">
              Members management coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetailPage;