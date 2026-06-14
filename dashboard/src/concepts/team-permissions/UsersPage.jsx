'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersThree, 
  Check, 
  X,
  PencilSimple,
  Trash,
  ShieldCheck,
  Plus,
  MagnifyingGlass
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Loader2 } from 'lucide-react';

// ✅ RTK QUERY IMPORTS
import {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
} from '@/services/api/rolesApi';

import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
} from '@/services/api/userApi';

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const RoleBadge = ({ role }) => {
  const roleColors = {
    super_admin: 'border-purple-500/50 text-purple-500',
    admin: 'border-red-500/50 text-red-500',
    developer: 'border-blue-500/50 text-blue-500',
    sales: 'border-green-500/50 text-green-500',
    hr: 'border-pink-500/50 text-pink-500',
  };

  return (
    <span className={`badge ${roleColors[role?.name?.toLowerCase()] || 'border-zinc-700 text-zinc-400'} bg-zinc-950 px-3 py-1 rounded-full text-sm`}>
      {role?.display_name || role?.name || 'No Role'}
    </span>
  );
};

export const UsersPage= () => {
  const { user: currentUser, hasRole } = useAuth();

  const [activeTab, setActiveTab] = useState('users');

  // RTK Queries & Mutations
  const { data: usersData = [], isLoading: loadingUsers } = useGetAllUsersQuery({});
  const { data: rolesData = [], isLoading: loadingRoles } = useGetAllRolesQuery();

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [assignRoleToUser] = useAssignRoleToUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Modals State
  const [editUserModal, setEditUserModal] = useState({ open: false, user: null });
  const [deleteUserConfirm, setDeleteUserConfirm] = useState({ open: false, user: null });
  const [roleModal, setRoleModal] = useState({ open: false, role: null });
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState({ open: false, role: null });
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);

  const [newRole, setNewRole] = useState({ name: '', hierarchy_level: 10, description: '' });
  const [editingRole, setEditingRole] = useState(null);

  const canEditUsers = hasRole(['SUPER_ADMIN', 'ADMIN', 'HR', 'DEVELOPER']);
  const canDeleteUsers = hasRole(['SUPER_ADMIN', 'ADMIN', 'HR', 'DEVELOPER']);
  const canManageRoles = hasRole(['SUPER_ADMIN', 'ADMIN', 'HR', 'DEVELOPER']);

  const users = usersData?.users || usersData || [];
  const roles = rolesData || [];

  // ==================== HANDLERS ====================

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return toast.error('Role name is required');
    try {
      await createRole(newRole).unwrap();
      toast.success('Role created successfully');
      setCreateRoleModal(false);
      setNewRole({ name: '', hierarchy_level: 10, description: '' });
    } catch (err) {
      toast.error('Failed to create role');
    }
  };

  const handleUpdateUser = async (updates) => {
    try {
      await updateUser({ userId: editUserModal.user.id, ...updates }).unwrap();
      toast.success('User updated');
      setEditUserModal({ open: false, user: null });
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser({ userId: deleteUserConfirm.user.id }).unwrap();
      toast.success('User deleted');
      setDeleteUserConfirm({ open: false, user: null });
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteRole = async () => {
    try {
      await deleteRole(deleteRoleConfirm.role.id).unwrap();
      toast.success('Role deleted');
      setDeleteRoleConfirm({ open: false, role: null });
    } catch (err) {
      toast.error('Failed to delete role');
    }
  };

  const handleAssignRole = async (userId, roleId) => {
    try {
      await assignRoleToUser({ userId, roleId }).unwrap();
      toast.success('Role assigned successfully');
      setSelectedUserForRole(null);
    } catch (err) {
      toast.error('Failed to assign role');
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Users & Roles" subtitle="Manage users and role-based access control" />

      <div className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="roles">Roles ({roles.length})</TabsTrigger>
          </TabsList>

          {/* ==================== USERS TAB ==================== */}
          <TabsContent value="users">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {loadingUsers ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Joined</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center font-medium">
                              {user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><RoleBadge role={user.role} /></td>
                        <td className="p-4">
                          <Badge variant={user.status === 'active' ? "default" : "destructive"}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-zinc-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {canEditUsers && (
                            <Button variant="ghost" size="icon" onClick={() => setEditUserModal({ open: true, user })}>
                              <PencilSimple className="w-4 h-4" />
                            </Button>
                          )}
                          {canDeleteUsers && (
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDeleteUserConfirm({ open: true, user })}>
                              <Trash className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => setSelectedUserForRole(user)}>
                            Change Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* ==================== ROLES TAB ==================== */}
          <TabsContent value="roles">
            {canManageRoles && (
              <div className="flex justify-end mb-4">
                <Button onClick={() => setCreateRoleModal(true)}>
                  <Plus className="mr-2 w-4 h-4" /> New Role
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
                  onClick={() => setRoleModal({ open: true, role })}
                >
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold">{role.display_name || role.name}</h3>
                    <ShieldCheck className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{role.description}</p>
                  <div className="mt-4 text-xs text-zinc-500 flex justify-between">
                    <span>Level {role.hierarchy_level}</span>
                    <span>{role.permissions?.length || 0} perms</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Edit User Modal */}
      <EditUserModal
        open={editUserModal.open}
        user={editUserModal.user}
        roles={roles}
        onClose={() => setEditUserModal({ open: false, user: null })}
        onSave={handleUpdateUser}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        open={createRoleModal}
        newRole={newRole}
        setNewRole={setNewRole}
        onClose={() => setCreateRoleModal(false)}
        onSave={handleCreateRole}
        isCreating={isCreating}
      />

      {/* Role Permissions Modal */}
      <RolePermissionsModal
        open={roleModal.open}
        role={roleModal.role}
        onClose={() => setRoleModal({ open: false, role: null })}
        onDelete={() => {
          setRoleModal({ open: false, role: null });
          setDeleteRoleConfirm({ open: true, role: roleModal.role });
        }}
      />

      {/* Delete User Confirmation */}
      <Dialog open={deleteUserConfirm.open} onOpenChange={(open) => !open && setDeleteUserConfirm({ open: false, user: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <p>Are you sure you want to delete <strong>{deleteUserConfirm.user?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserConfirm({ open: false, user: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <Dialog open={deleteRoleConfirm.open} onOpenChange={(open) => !open && setDeleteRoleConfirm({ open: false, role: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle>Delete Role</DialogTitle></DialogHeader>
          <p>Delete role <strong>{deleteRoleConfirm.role?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoleConfirm({ open: false, role: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRole}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role to User */}
      <Dialog open={!!selectedUserForRole} onOpenChange={() => setSelectedUserForRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role for @{selectedUserForRole?.username}</DialogTitle>
          </DialogHeader>
          <Select onValueChange={(roleId) => handleAssignRole(selectedUserForRole?.id, roleId)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name} (Level {role.hierarchy_level})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ====================== MODALS ====================== */

const EditUserModal = ({ open, user, roles, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', role: '', is_active: false });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role?.id || '',
        is_active: user.is_active ?? true,
      });
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CreateRoleModal = ({ open, newRole, setNewRole, onClose, onSave, isCreating }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="bg-zinc-900 border-zinc-800">
      <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Role Name</Label>
          <Input value={newRole.name} onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))} />
        </div>
        <div>
          <Label>Hierarchy Level</Label>
          <Input type="number" value={newRole.hierarchy_level} onChange={(e) => setNewRole(prev => ({ ...prev, hierarchy_level: +e.target.value }))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} disabled={isCreating}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Role
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// RolePermissionsModal can be expanded similarly as in your previous version.
// Let me know if you want the full detailed permissions modal added.

// Role Permissions Modal (Add this after the other modals)
const RolePermissionsModal = ({
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


export default UsersPage;
