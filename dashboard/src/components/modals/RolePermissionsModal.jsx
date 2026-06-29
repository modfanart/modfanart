'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash, PencilSimple, ShieldCheck, Check, MagnifyingGlass } from '@phosphor-icons/react';
import { useUpdateRoleMutation } from '../../services/api/rolesApi';
import { toast } from 'sonner';


export const RolePermissionsModal = ({
  open,
  role,
  onClose,
  onDelete,
  canEdit = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [updateRole] = useUpdateRoleMutation();

  // Reset state when modal opens with new role
  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions || []);
      setIsEditing(false);
      setSearchTerm('');
    }
  }, [role]);

  const togglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const toggleModule = (module, permissionsByModule) => {
    const modulePerms = permissionsByModule[module] || [];
    const moduleIds = modulePerms.map((p) => p.id);

    const allSelected = moduleIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !moduleIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...moduleIds])]);
    }
  };

  const isModuleFullySelected = (module, permissionsByModule) => {
    const moduleIds = (permissionsByModule[module] || []).map((p) => p.id);
    return moduleIds.length > 0 && moduleIds.every(id => selectedPermissions.includes(id));
  };

  const isModulePartiallySelected = (module, permissionsByModule) => {
    const moduleIds = (permissionsByModule[module] || []).map((p) => p.id);
    const selectedCount = moduleIds.filter(id => selectedPermissions.includes(id)).length;
    return selectedCount > 0 && selectedCount < moduleIds.length;
  };

  const handleSave = async () => {
    if (!role) return;
    try {
      await updateRole({
        id: role.id,
        permissions: selectedPermissions,
      }).unwrap();

      toast.success('Role permissions updated successfully');
      setIsEditing(false);
      onClose();
    } catch (error) {
      toast.error('Failed to update role permissions');
    }
  };

  if (!role) return null;

  // You can pass permissionsByModule from parent if needed, or fetch it
  // For now, using a placeholder. Replace with your actual data.
  const permissionsByModule = role.permissionsByModule || {}; // Adjust according to your API response

  const filteredModules = Object.keys(permissionsByModule).filter(module => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      module.toLowerCase().includes(term) ||
      permissionsByModule[module].some((p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term)
      )
    );
  });

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white">
            <ShieldCheck weight="duotone" className="w-6 h-6" />
            {role.display_name || role.name} — Permissions
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Role Info */}
          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
            <p className="text-zinc-400 text-sm">{role.description || 'No description provided.'}</p>
            <div className="flex gap-4 mt-3 text-xs text-zinc-500">
              <span>Hierarchy Level: <strong className="text-white">{role.hierarchy_level}</strong></span>
              <span>{selectedPermissions.length} permissions selected</span>
              {role.is_system && <span className="text-amber-500">System Role (Protected)</span>}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search permissions or modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800"
            />
          </div>

          {/* Permissions List */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 pb-6">
              {filteredModules.length === 0 ? (
                <p className="text-center text-zinc-500 py-10">No matching permissions found.</p>
              ) : (
                filteredModules.map((module) => (
                  <div key={module} className="border border-zinc-800 rounded-xl overflow-hidden">
                    {/* Module Header */}
                    <div
                      className="flex items-center justify-between bg-zinc-950 px-4 py-3 cursor-pointer hover:bg-zinc-900"
                      onClick={() => isEditing && toggleModule(module, permissionsByModule)}
                    >
                      <div className="flex items-center gap-3">
                        {isEditing && (
                          <Checkbox
                            checked={isModuleFullySelected(module, permissionsByModule)}
                            className={isModulePartiallySelected(module, permissionsByModule) ? "data-[state=checked]:bg-zinc-600" : ""}
                          />
                        )}
                        <span className="font-medium text-white capitalize">{module}</span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {permissionsByModule[module]?.filter((p) => selectedPermissions.includes(p.id)).length} / {permissionsByModule[module]?.length || 0}
                      </span>
                    </div>

                    {/* Permissions */}
                    <div className="p-3 space-y-1">
                      {permissionsByModule[module]?.map((perm) => (
                        <div
                          key={perm.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isEditing ? 'hover:bg-zinc-800 cursor-pointer' : ''}`}
                          onClick={() => isEditing && togglePermission(perm.id)}
                        >
                          {isEditing ? (
                            <Checkbox
                              checked={selectedPermissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                          ) : (
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPermissions.includes(perm.id) ? 'bg-green-600 border-green-600' : 'border-zinc-700'}`}>
                              {selectedPermissions.includes(perm.id) && <Check className="w-3.5 h-3.5" />}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200">{perm.name}</p>
                            {perm.description && (
                              <p className="text-xs text-zinc-500 line-clamp-1">{perm.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-3 border-t border-zinc-800 pt-4">
          {!role.is_system && canEdit && !isEditing && (
            <Button
              variant="outline"
              className="border-red-500/30 text-red-500 hover:bg-red-500/10 self-start"
              onClick={onDelete}
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Role
            </Button>
          )}

          <div className="flex gap-3 ml-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-zinc-700"
            >
              {isEditing ? 'Cancel' : 'Close'}
            </Button>

            {canEdit && (
              isEditing ? (
                <Button onClick={handleSave} className="bg-white text-black hover:bg-zinc-200">
                  Save Permissions
                </Button>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  <PencilSimple className="w-4 h-4 mr-2" />
                  Edit Permissions
                </Button>
              )
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};