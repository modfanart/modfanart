import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCreateTaskMutation } from '../../services/api/projectTasksApi';
import { toast } from 'sonner';

const TaskCreateModal = ({ 
  open, 
  onOpenChange, 
  projectId   // ← Added this prop
}) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: projectId || '',   // Pre-fill project ID
    priority: 'medium',
    due_date: '',
  });

  // Reset form when modal closes, but keep projectId for next open
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        project_id: projectId || '',     // Preserve projectId
        priority: 'medium',
        due_date: '',
      });
    }
  }, [open, projectId]);

  // Update project_id if projectId prop changes
  useEffect(() => {
    if (projectId) {
      setFormData(prev => ({ ...prev, project_id: projectId }));
    }
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        project_id: projectId || formData.project_id || null,   // Use prop first
        priority: formData.priority,
        due_date: formData.due_date || null,
        status: 'todo',
      }).unwrap();

      toast.success('Task created successfully!');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add a new task to your project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Design new landing page"
              className="bg-zinc-950 border-zinc-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task details..."
              className="bg-zinc-950 border-zinc-700 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-zinc-950 border-zinc-700"
              />
            </div>
          </div>

          {/* Optional: Show which project this task belongs to */}
          {projectId && (
            <div className="text-sm text-zinc-500">
              This task will be added to: <span className="text-white font-medium">Project {projectId}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCreateModal;