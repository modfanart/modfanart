'use client';

import { useState } from 'react';
import {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
  Role,
  CreateRoleRequest,
} from '@/services/api/rolesApi';

import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  UserProfile,
} from '@/services/api/userApi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Trash2, Plus, Edit, Shield, Loader2, ShieldCheck, Users } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';

const DEFAULT_ROLE: Partial<CreateRoleRequest> = {
  name: '',
  hierarchy_level: 10,
  permissions: {},
};

const COMMON_PERMISSIONS = [
  'artwork:upload',
  'artwork:edit',
  'artwork:delete',
  'contest:create',
  'contest:manage',
  'user:manage',
  'role:manage',
  'moderation:approve',
  'moderation:ban',
  'view:analytics',
];

export default function RolesPermissionsPage() {
  const { toast } = useToast();

  // Roles
  const { data: roles = [], isLoading: rolesLoading } = useGetAllRolesQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [assignRoleToUser] = useAssignRoleToUserMutation();

  // Users (Admin)
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery({
    page: 1,
    limit: 50,
    sort: 'created_at',
    order: 'desc',
  });
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [newRole, setNewRole] = useState(DEFAULT_ROLE);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserProfile | null>(null);

  const validateRole = (role?: Partial<CreateRoleRequest>) => role?.name?.trim();

  const handleCreate = async () => {
    if (!validateRole(newRole)) {
      toast({ title: 'Role name is required', variant: 'destructive' });
      return;
    }
    await createRole({
      name: newRole.name!.trim(),
      hierarchy_level: newRole.hierarchy_level ?? 10,
      permissions: newRole.permissions ?? {},
    });
    toast({ title: 'Role created successfully' });
    setNewRole(DEFAULT_ROLE);
  };

  const handleUpdate = async () => {
    if (!editingRole) return;
    await updateRole(editingRole);
    toast({ title: 'Role updated' });
    setEditingRole(null);
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Delete this role?')) return;
    await deleteRole(id);
    toast({ title: 'Role deleted' });
  };

  const togglePermission = (perm: string, value: boolean) => {
    if (!editingRole) return;
    setEditingRole({
      ...editingRole,
      permissions: {
        ...editingRole.permissions,
        [perm]: value,
      },
    });
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    await assignRoleToUser({ roleId, userId });
    toast({ title: 'Role assigned successfully' });
    setSelectedUserForRole(null);
  };

  const handleStatusChange = async (userId: string, status: UserProfile['status']) => {
    await updateUserStatus({ userId, status });
    toast({ title: `User status updated to ${status}` });
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) return;
    await deleteUser({ userId });
    toast({ title: 'User deleted' });
  };

  const nonArtistUsers = (usersData?.users || []).filter(
    (user) => user.role?.name?.toUpperCase() !== 'ARTIST'
  );

  if (rolesLoading || usersLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Roles &amp; Users</h1>
            <p className="text-muted-foreground text-sm">
              Manage roles, permissions, and admin users
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles &amp; Permissions
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users Management
          </TabsTrigger>
        </TabsList>

        {/* ==================== ROLES TAB ==================== */}
        <TabsContent value="roles">
          {/* Create Role Button */}
          <div className="flex justify-end mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Role Name</Label>
                    <Input
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Hierarchy Level</Label>
                    <Input
                      type="number"
                      value={newRole.hierarchy_level}
                      onChange={(e) =>
                        setNewRole({
                          ...newRole,
                          hierarchy_level: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>System roles are protected</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {role.name}
                      </TableCell>
                      <TableCell>{role.hierarchy_level}</TableCell>
                      <TableCell>
                        <Badge variant={role.is_system ? 'outline' : 'secondary'}>
                          {role.is_system ? 'System' : 'Custom'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(role.permissions || {})
                            .filter(([, v]) => v)
                            .slice(0, 4)
                            .map(([p]) => (
                              <Badge key={p} variant="outline" className="text-xs">
                                {p}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={role.is_system}
                            onClick={() => setEditingRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!role.is_system && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== USERS TAB ==================== */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users (Excluding Artists)</CardTitle>
              <CardDescription>
                Admin / Moderator / Custom role users • Total: {nonArtistUsers.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nonArtistUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.avatar_url && (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-medium">@{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{user.role?.name || 'No Role'}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            user.status === 'active'
                              ? 'default'
                              : user.status === 'suspended'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>

                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Assign Role */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUserForRole(user)}
                          >
                            Change Role
                          </Button>

                          {/* Status */}
                          <Select
                            value={user.status}
                            onValueChange={(val) =>
                              handleStatusChange(user.id, val as UserProfile['status'])
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="suspended">Suspend</SelectItem>
                              <SelectItem value="deactivated">Deactivate</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Delete */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-6">
              <Input
                value={editingRole.name}
                onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_PERMISSIONS.map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center justify-between border rounded-lg px-3 py-2"
                  >
                    <span className="text-sm">{perm}</span>
                    <Switch
                      checked={editingRole.permissions?.[perm] ?? false}
                      onCheckedChange={(v) => togglePermission(perm, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change User Role Dialog */}
      <Dialog open={!!selectedUserForRole} onOpenChange={() => setSelectedUserForRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to @{selectedUserForRole?.username}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={(roleId) =>
                selectedUserForRole && handleAssignRole(selectedUserForRole.id, roleId)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name} (Level {role.hierarchy_level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
