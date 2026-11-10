import React, { useState } from 'react';
import { Plus, ShieldCheck } from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useGetAllRolesQuery, useCreateRoleMutation, useDeleteRoleMutation } from '../../services/api/rolesApi';
import { RolePermissionsModal } from '../../components/modals/RolePermissionsModal';
import { useAuth } from '../../contexts/AuthContext';

export const RolesPage = () => {
  const { hasRole } = useAuth();
  const canManageRoles = hasRole(['SUPER_ADMIN', 'ADMIN', 'HR', 'DEVELOPER']);
  const { data: rolesData = [], isLoading } = useGetAllRolesQuery();
  const roles = rolesData || [];
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const [roleModal, setRoleModal] = useState({ open: false, role: null });
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState({ open: false, role: null });
  const [newRole, setNewRole] = useState({ name: '', hierarchy_level: 10, description: '' });

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) { toast.error('Role name is required'); return; }
    try {
      await createRole(newRole).unwrap();
      toast.success('Role created successfully');
      setCreateRoleModal(false);
      setNewRole({ name: '', hierarchy_level: 10, description: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleConfirm.role) return;
    try {
      await deleteRole(deleteRoleConfirm.role.id).unwrap();
      toast.success('Role deleted successfully');
      setDeleteRoleConfirm({ open: false, role: null });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Roles" subtitle="Role-based access control and permissions" />
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">All Roles</h2>
            <p className="text-sm text-zinc-500 mt-1">{roles.length} role{roles.length !== 1 ? 's' : ''} defined</p>
          </div>
          {canManageRoles && (
            <Button onClick={() => setCreateRoleModal(true)}>
              <Plus className="mr-2 w-4 h-4" />
              New Role
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20 text-zinc-500"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : roles.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-xl bg-zinc-900/50">
            <ShieldCheck className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-400">No roles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => setRoleModal({ open: true, role })}>
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold text-white">{role.display_name || role.name}</h3>
                  <ShieldCheck className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{role.description || 'No description'}</p>
                <div className="mt-4 text-xs text-zinc-500 flex justify-between">
                  <span>Level {role.hierarchy_level}</span>
                  <span>{role.permissions?.length || 0} perms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <RolePermissionsModal open={roleModal.open} role={roleModal.role} onClose={() => setRoleModal({ open: false, role: null })} onDelete={() => { setRoleModal({ open: false, role: null }); setDeleteRoleConfirm({ open: true, role: roleModal.role }); }} />
      <Dialog open={createRoleModal} onOpenChange={(open) => !open && setCreateRoleModal(false)}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Create New Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Role Name</Label><Input value={newRole.name} onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))} className="bg-zinc-950 border-zinc-700" /></div>
            <div><Label>Hierarchy Level</Label><Input type="number" value={newRole.hierarchy_level} onChange={(e) => setNewRole((p) => ({ ...p, hierarchy_level: Number(e.target.value) }))} className="bg-zinc-950 border-zinc-700" /></div>
            <div><Label>Description</Label><Input value={newRole.description} onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))} className="bg-zinc-950 border-zinc-700" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRole} disabled={isCreating}>{isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteRoleConfirm.open} onOpenChange={(open) => !open && setDeleteRoleConfirm({ open: false, role: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-white">Delete Role</DialogTitle></DialogHeader>
          <p className="text-zinc-300">Delete <strong className="text-white">{deleteRoleConfirm.role?.display_name || deleteRoleConfirm.role?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoleConfirm({ open: false, role: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRole}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPage;
