// components/projects/ProjectCreateModal.tsx
import React, { useState } from 'react';
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
import { useCreateProjectMutation } from '../../services/api/projectTasksApi';
import { toast } from 'sonner';

const ProjectCreateModal = ({ open, onOpenChange, onProjectCreated }) => {
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || '',
      }).unwrap();

      toast.success('Project created successfully!');
      
      // Reset form
      setFormData({ name: '', description: '' });
      onOpenChange(false);
      onProjectCreated?.();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create project');
    }
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setFormData({ name: '', description: '' });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Start a new project to organize your tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-200">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="E.g. Website Redesign"
              className="bg-zinc-950 border-zinc-700 text-white"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-200">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project..."
              className="bg-zinc-950 border-zinc-700 text-white resize-y min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateModal;