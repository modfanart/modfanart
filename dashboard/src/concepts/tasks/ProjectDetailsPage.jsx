import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckSquare, Users, UserPlus } from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';

// RTK Query
import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
} from '../../services/api/projectTasksApi';

import TasksList from '../../components/project-tasks/TasksList';        // ← Updated
import TaskCreateModal from '../../components/project-tasks/TaskCreateModal';
import AddMemberModal from '../../components/project-tasks/AddMemberModal';

export const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tasks');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Queries
  const { data: projectData, isLoading: projectLoading } = useGetProjectByIdQuery(projectId);
  const { data: tasksData, isLoading: tasksLoading } = useGetProjectTasksQuery(projectId);
  const { data: membersData, isLoading: membersLoading } = useGetProjectMembersQuery(projectId);

  const project = projectData?.data || projectData || {};
  const tasks = tasksData?.data || tasksData || [];
  const members = membersData?.data || membersData || [];

  const [addProjectMember] = useAddProjectMemberMutation();

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
            {members.length} Members
          </Badge>
          <Badge variant="outline">{tasks.length} Tasks</Badge>
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

          {/* TASKS TAB - Using TasksList */}
          <TabsContent value="tasks" className="space-y-4">
            <TasksList 
              tasks={tasks}
              isLoading={tasksLoading}
              projectId={projectId}
              onCreateTaskClick={() => setIsCreateTaskOpen(true)}   // Connects to modal
            />
          </TabsContent>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Project Overview</h3>
              <p className="text-zinc-400 leading-relaxed">
                {project?.description || 'No description provided.'}
              </p>
            </div>
          </TabsContent>

          {/* MEMBERS TAB */}
          <TabsContent value="members">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Members</h2>
              <Button 
                onClick={() => setIsAddMemberOpen(true)} 
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              {membersLoading ? (
                <p>Loading members...</p>
              ) : members.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">No members yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                        ) : (
                          <span className="text-lg font-medium">
                            {member.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <TaskCreateModal
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        projectId={projectId}
      />

      <AddMemberModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectDetailPage;