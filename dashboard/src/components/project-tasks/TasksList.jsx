import React, { useState } from 'react';
import { Plus, Calendar, User, Clock } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';

const TasksList = ({ tasks = [], isLoading, projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      return matchesSearch && task.status === statusFilter;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'todo':
      case 'to_do':
        return 'bg-zinc-700 text-white';
      case 'in_progress':
      case 'inprogress':
        return 'bg-blue-600 text-white';
      case 'review':
        return 'bg-amber-600 text-white';
      case 'done':
      case 'completed':
        return 'bg-green-600 text-white';
      default:
        return 'bg-zinc-700 text-white';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-zinc-500';
    }
  };

  if (isLoading) {
    return <p className="text-zinc-400 py-10">Loading tasks...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-white text-lg">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 text-sm">
                  <div className="flex items-center gap-6">
                    {/* Priority */}
                    {task.priority && (
                      <div className={`flex items-center gap-1.5 ${getPriorityColor(task.priority)}`}>
                        <span className="font-medium">Priority:</span>
                        <span className="capitalize">{task.priority}</span>
                      </div>
                    )}

                    {/* Due Date */}
                    {task.due_date && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Assignee */}
                  {task.assignee && (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium">
                        {task.assignee.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-zinc-400 text-sm">{task.assignee.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksList;