import React, { useState } from 'react';
import { Plus, Calendar } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

const TasksList = ({
  tasks = [],
  isLoading,
  onCreateTaskClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Normalize API (support both raw + wrapped response)
  const taskList = Array.isArray(tasks) ? tasks : tasks?.data || [];

  // FILTER + SEARCH
  const filteredTasks = taskList
    .filter((task) => {
      const search = (searchTerm || '').toLowerCase();

      const matchesSearch =
        task.title?.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        task.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return 'bg-zinc-700 text-white';
      case 'in_progress':
        return 'bg-blue-600 text-white';
      case 'review':
        return 'bg-amber-600 text-white';
      case 'done':
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
    <div className="space-y-5">

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">

        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:w-80 bg-zinc-900 border-zinc-800"
        />

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>

          <Button onClick={onCreateTaskClick} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto border border-zinc-800 rounded-lg">
        <table className="w-full text-sm text-left">

          <thead className="bg-zinc-900 text-zinc-300">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Due Date</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-10 text-zinc-400">
                  No tasks found
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900 transition"
                >

                  {/* TITLE */}
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-white">
                        {task.title}
                      </p>
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="p-3">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>

                  {/* PRIORITY */}
                  <td className="p-3">
                    <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority || '-'}
                    </span>
                  </td>

                  {/* DUE DATE */}
                  <td className="p-3 text-zinc-400">
                    {task.due_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* CREATED */}
                  <td className="p-3 text-zinc-400">
                    {new Date(task.created_at).toLocaleDateString()}
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default TasksList;