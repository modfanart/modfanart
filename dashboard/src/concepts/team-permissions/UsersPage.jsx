
import React, { useState } from 'react';
import {
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
import { Loader2 } from 'lucide-react';

// RTK Query Imports
import {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
} from '../../services/api/rolesApi';

import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useCreateUserMutation,
} from '../../services/api/userApi';

import { UserFormModal } from '../../components/modals/UserFormModal';
import { RolePermissionsModal } from '../../components/modals/RolePermissionsModal';

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

export const UsersPage = () => {
  const { hasRole } = useAuth();

  const [activeTab, setActiveTab] = useState('users');
  const [userModal, setUserModal] = useState({ open: false, user: null });
  const [deleteUserConfirm, setDeleteUserConfirm] = useState({ open: false, user: null });
  const [roleModal, setRoleModal] = useState({ open: false, role: null });
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState({ open: false, role: null });
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);

  const [newRole, setNewRole] = useState({ name: '', hierarchy_level: 10, description: '' });

  // RTK Queries & Mutations
  const { data: usersData = [], isLoading: loadingUsers } = useGetAllUsersQuery({});
  const { data: rolesData = [] } = useGetAllRolesQuery();

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [assignRoleToUser] = useAssignRoleToUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();

  const canManageUsers = hasRole(['SUPER_ADMIN', 'ADMIN', 'HR', 'DEVELOPER']);
  const canManageRoles = hasRole(['SUPER_ADMIN', 'ADMIN', 'HR', 'DEVELOPER']);

  const users = usersData?.users || usersData || [];
  const roles = rolesData || [];

  // ==================== HANDLERS ====================

  const handleCreateUser = async (data) => {
    await createUser(data).unwrap();
  };

  const handleUpdateUser = async (data) => {
    await updateUser(data).unwrap();
  };

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

  const handleDeleteUser = async () => {
    try {
      await deleteUser({ userId: deleteUserConfirm.user.id }).unwrap();
      toast.success('User deleted successfully');
      setDeleteUserConfirm({ open: false, user: null });
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteRole = async () => {
    try {
      await deleteRole(deleteRoleConfirm.role.id).unwrap();
      toast.success('Role deleted successfully');
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Users</h2>
              {canManageUsers && (
                <Button onClick={() => setUserModal({ open: true, user: null })}>
                  <Plus className="mr-2 w-4 h-4" />
                  Add User
                </Button>
              )}
            </div>

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
                          {canManageUsers && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setUserModal({ open: true, user })}
                              >
                                <PencilSimple className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500"
                                onClick={() => setDeleteUserConfirm({ open: true, user })}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUserForRole(user)}
                          >
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

      <UserFormModal
        open={userModal.open}
        user={userModal.user}
        roles={roles}
        onClose={() => setUserModal({ open: false, user: null })}
        onSave={userModal.user ? handleUpdateUser : handleCreateUser}
        isLoading={isCreatingUser}
      />

      <RolePermissionsModal
        open={roleModal.open}
        role={roleModal.role}
        onClose={() => setRoleModal({ open: false, role: null })}
        onDelete={() => {
          setRoleModal({ open: false, role: null });
          setDeleteRoleConfirm({ open: true, role: roleModal.role });
        }}
      />

      {/* Create Role Modal */}
      <Dialog open={createRoleModal} onOpenChange={(open) => !open && setCreateRoleModal(false)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role Name</Label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Hierarchy Level</Label>
              <Input
                type="number"
                value={newRole.hierarchy_level}
                onChange={(e) => setNewRole(prev => ({ ...prev, hierarchy_level: +e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRole} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
};

export default UsersPage;
