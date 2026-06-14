import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Eye,
} from '@phosphor-icons/react';

import { Button } from '../ui/button';
import ProjectCreateModal from './CreateProjectModal';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { useDeleteProjectMutation } from '../../services/api/projectTasksApi';

const ProjectsTab = ({ projects, isLoading }) => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [deleteProject, { isLoading: isDeleting }] =
    useDeleteProjectMutation();

  const projectList = projects?.data || [];

  const handleOpenProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );

    if (!confirmed) return;

    try {
      await deleteProject(projectId).unwrap();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-zinc-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Projects
        </h2>

        <Button
          onClick={() => {
            setSelectedProject(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {/* Empty State */}
      {projectList.length === 0 ? (
        <div className="text-center py-12 border border-zinc-800 rounded-lg">
          <p className="text-zinc-400 mb-4">
            No projects found
          </p>

          <Button
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-zinc-400">
                  Name
                </th>

                <th className="px-4 py-3 text-left text-zinc-400">
                  Description
                </th>

                <th className="px-4 py-3 text-left text-zinc-400">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-zinc-400">
                  Created
                </th>

                <th className="px-4 py-3 text-right text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {projectList.map((project) => (
                <tr
                  key={project.id}
                  className="border-t border-zinc-800 hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {project.name}
                  </td>

                  <td className="px-4 py-3 text-zinc-400">
                    {project.description || '-'}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs ${
                        project.is_active
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {project.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <DotsThreeVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleOpenProject(project.id)
                          }
                        >
                          <Eye
                            size={16}
                            className="mr-2"
                          />
                          Open
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleEditProject(project)
                          }
                        >
                          <PencilSimple
                            size={16}
                            className="mr-2"
                          />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() =>
                            handleDeleteProject(project.id)
                          }
                          disabled={isDeleting}
                        >
                          <Trash
                            size={16}
                            className="mr-2"
                          />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectCreateModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        project={selectedProject}
      />
    </div>
  );
};

export default ProjectsTab;