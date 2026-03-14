// app/roles-permissions/page.tsx
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

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Trash2, Plus, Edit, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DashboardShell } from '@/components/dashboard-shell';

export default function RolesPermissionsPage() {
  const { toast } = useToast();

  const { data: roles = [], isLoading } = useGetAllRolesQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const [newRole, setNewRole] = useState<Partial<CreateRoleRequest>>({
    name: '',
    hierarchy_level: 10,
    permissions: {},
  });

  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleCreate = async () => {
    if (!newRole.name?.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    try {
      await createRole({
        name: newRole.name.trim(),
        hierarchy_level: newRole.hierarchy_level ?? 10,
        permissions: newRole.permissions ?? {},
      }).unwrap();

      toast({ title: 'Role created successfully' });
      setNewRole({ name: '', hierarchy_level: 10, permissions: {} });
    } catch (err: any) {
      toast({
        title: 'Failed to create role',
        description: err?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingRole) return;

    try {
      await updateRole({
        id: editingRole.id,
        name: editingRole.name,
        hierarchy_level: editingRole.hierarchy_level,
        permissions: editingRole.permissions,
      }).unwrap();

      toast({ title: 'Role updated' });
      setEditingRole(null);
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.data?.message || 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await deleteRole(roleId).unwrap();
      toast({ title: 'Role deleted' });
    } catch (err: any) {
      toast({
        title: 'Cannot delete role',
        description: err?.data?.message || 'Possibly in use or system role',
        variant: 'destructive',
      });
    }
  };

  const togglePermission = (role: Role, perm: string, checked: boolean) => {
    if (editingRole?.id === role.id) {
      setEditingRole({
        ...editingRole,
        permissions: {
          ...editingRole.permissions,
          [perm]: checked,
        },
      });
    }
  };

  const commonPermissions = [
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Roles & Permissions</h1>
        <div className="grid gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage system roles and granular permissions
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define a new role with its hierarchy level and permissions.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g. Moderator, Content Creator, Brand Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Hierarchy Level (lower = more powerful)</Label>
                  <Input
                    id="level"
                    type="number"
                    min={0}
                    max={100}
                    value={newRole.hierarchy_level}
                    onChange={(e) =>
                      setNewRole({ ...newRole, hierarchy_level: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    System roles usually have levels 0–10. User roles 20+
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setNewRole({ name: '', hierarchy_level: 10, permissions: {} })}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating || !newRole.name?.trim()}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System & Custom Roles</CardTitle>
            <CardDescription>
              System roles cannot be deleted or have their hierarchy changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>{role.hierarchy_level}</TableCell>
                      <TableCell>
                        {role.is_system ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-800">
                            System
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {Object.keys(role.permissions).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(role.permissions)
                              .filter(([, enabled]) => enabled)
                              .slice(0, 5)
                              .map(([perm]) => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            {Object.keys(role.permissions).length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{Object.keys(role.permissions).length - 5}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No permissions</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingRole({ ...role })}
                            disabled={role.is_system}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {!role.is_system && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(role.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Role Dialog */}
        <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Role: {editingRole?.name}</DialogTitle>
              <DialogDescription>
                Modify name, hierarchy, and permissions for this role.
              </DialogDescription>
            </DialogHeader>

            {editingRole && (
              <div className="py-6 space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input
                      value={editingRole.name}
                      onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                      disabled={editingRole.is_system}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hierarchy Level</Label>
                    <Input
                      type="number"
                      value={editingRole.hierarchy_level}
                      onChange={(e) =>
                        setEditingRole({
                          ...editingRole,
                          hierarchy_level: Number(e.target.value),
                        })
                      }
                      disabled={editingRole.is_system}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Permissions</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {commonPermissions.map((perm) => (
                      <div
                        key={perm}
                        className="flex items-center justify-between space-x-2 border rounded-md p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{perm}</span>
                        </div>
                        <Switch
                          checked={editingRole.permissions?.[perm] ?? false}
                          onCheckedChange={(checked) =>
                            togglePermission(editingRole, perm, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: Only common permissions shown. Full permissions object can be edited via
                    API if needed.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating || !editingRole?.name?.trim()}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}
