import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, User, Flag, CheckSquare } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

// RTK Query
import {
  useGetMyTasksQuery,
  useUpdateTaskStatusMutation,
  useAssignTaskMutation,
} from '../../services/api/projectTasksApi';

import TaskCreateModal from './TaskCreateModal';   // ← Import Modal

const statusColors = {
  backlog: 'bg-zinc-700 text-zinc-300',
  todo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
  done: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-zinc-600 text-zinc-400',
};

const priorityColors = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

const TasksTab = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: tasksData = {},
    isLoading,
    error,
    refetch,
  } = useGetMyTasksQuery();

  const tasks = tasksData?.data || [];

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [assignTask] = useAssignTaskMutation();

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter(task => task.status === filterStatus);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus({ id: taskId, status: newStatus }).unwrap();
      toast.success('Task status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">Failed to load tasks</p>
        <Button onClick={refetch} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">My Tasks</h2>
          <p className="text-zinc-400 text-sm mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="text-center py-16">
            <CheckSquare className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-lg">No tasks found</p>
            <p className="text-zinc-500 mt-2">You don’t have any tasks at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
              onClick={() => handleViewTask(task.id)}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, e.target.checked ? 'done' : 'todo');
                          }}
                          className="w-5 h-5 accent-white cursor-pointer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-white group-hover:text-blue-400 transition-colors ${task.status === 'done' ? 'line-through text-zinc-500' : ''}`}>
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-3 text-xs">
                          {task.project_name && (
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                              {task.project_name}
                            </Badge>
                          )}

                          {task.due_date && (
                            <div className="flex items-center gap-1 text-zinc-500">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}

                          {task.assigned_to_name && (
                            <div className="flex items-center gap-1 text-zinc-500">
                              <User className="w-3.5 h-3.5" />
                              <span>{task.assigned_to_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col items-end gap-3 md:min-w-[180px]">
                    <div className="flex gap-2">
                      <Badge className={`capitalize ${statusColors[task.status] || 'bg-zinc-700 text-white'}`}>
                        {task.status.replace('_', ' ')}
                      </Badge>

                      <Badge variant="outline" className={`capitalize ${priorityColors[task.priority]}`}>
                        <Flag className="w-3 h-3 mr-1" />
                        {task.priority}
                      </Badge>
                    </div>

                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task.id, value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectTrigger className="w-40 bg-zinc-950 border-zinc-700 text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task Create Modal */}
      <TaskCreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
};

export default TasksTab;