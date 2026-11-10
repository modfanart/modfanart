import React from 'react';
import { Header } from '../../components/layout/Header';
import AgendaNav from '../../components/project-tasks/AgendaNav';
import TasksTab from '../../components/project-tasks/TasksTab';
import { useGetMyTasksQuery } from '../../services/api/projectTasksApi';

export const MyTasksPage = () => {
  const { data: tasks = [], isLoading: tasksLoading } = useGetMyTasksQuery();
  return (
    <div className="min-h-screen bg-zinc-950" data-testid="my-tasks-page">
      <Header title="My Tasks" subtitle="Tasks assigned to you" />
      <div className="p-4 sm:p-6">
        <AgendaNav />
        <TasksTab tasks={tasks} isLoading={tasksLoading} />
      </div>
    </div>
  );
};

export default MyTasksPage;
