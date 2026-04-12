'use client';

import { useState } from 'react';
import {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  Role,
  CreateRoleRequest,
} from '@/services/api/rolesApi';

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

import { Trash2, Plus, Edit, Shield, Loader2, ShieldCheck } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { DashboardShell } from '@/components/dashboard-shell';

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
  const { data: roles = [], isLoading } = useGetAllRolesQuery();

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [newRole, setNewRole] = useState(DEFAULT_ROLE);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

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

    toast({ title: 'Role created' });
    setNewRole(DEFAULT_ROLE);
  };
  const handleUpdate = async () => {
    if (!editingRole) return;
    await updateRole(editingRole);
    toast({ title: 'Role updated' });
    setEditingRole(null);
  };

  const handleDelete = async (id: string) => {
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

  if (isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Roles & Permissions</h1>
            <p className="text-muted-foreground text-sm">
              Manage access control and role hierarchy
            </p>
          </div>
        </div>

        {/* CREATE ROLE */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Role
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Role</DialogTitle>
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
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ROLES TABLE */}
      <Card className="shadow-sm border rounded-2xl">
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>System roles are protected and cannot be deleted</CardDescription>
        </CardHeader>

        <CardContent>
          {roles.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No roles found</p>
              <p className="text-xs text-muted-foreground">Create your first role</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-muted/40">
                    {/* ROLE */}
                    <TableCell className="flex items-center gap-2 font-medium">
                      <Shield className="h-4 w-4 text-primary" />
                      {role.name}
                    </TableCell>

                    {/* LEVEL */}
                    <TableCell>{role.hierarchy_level}</TableCell>

                    {/* TYPE */}
                    <TableCell>
                      <Badge variant={role.is_system ? 'outline' : 'secondary'}>
                        {role.is_system ? 'System' : 'Custom'}
                      </Badge>
                    </TableCell>

                    {/* PERMISSIONS */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permissions || {})
                          .filter(([, v]) => v)
                          .slice(0, 4)
                          .map(([p]) => (
                            <Badge key={p} variant="outline">
                              {p}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={role.is_system}
                        onClick={() => setEditingRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {!role.is_system && (
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(role.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* EDIT ROLE */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>

          {editingRole && (
            <div className="space-y-6">
              <Input
                value={editingRole.name}
                onChange={(e) =>
                  setEditingRole({
                    ...editingRole,
                    name: e.target.value,
                  })
                }
              />

              {/* PERMISSIONS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_PERMISSIONS.map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-muted/40"
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
    </div>
  );
}
