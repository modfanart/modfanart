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
import { 
  getUsers, 
  updateUser, 
  deleteUser, 
  getRoles, 
  getRole,
  createRole, 
  updateRolePermissions, 
  deleteRole,
  getPermissionsByModule
} from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const RoleBadge = ({ role }) => {
  const roleColors = {
    super_admin: 'border-purple-500/50 text-purple-500',
    admin: 'border-red-500/50 text-red-500',
    developer: 'border-blue-500/50 text-blue-500',
    sales: 'border-green-500/50 text-green-500',
    ops: 'border-yellow-500/50 text-yellow-500',
    hr: 'border-pink-500/50 text-pink-500',
  };

  return (
    <span className={`badge ${roleColors[role] || 'border-zinc-700 text-zinc-400'} bg-zinc-950`}>
      {role?.replace('_', ' ')}
    </span>
  );
};

export const UsersPage = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, user: null });
  
  // Roles state
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [roleModal, setRoleModal] = useState({ open: false, role: null, mode: 'view' });
  const [createRoleModal, setCreateRoleModal] = useState(false);
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState({ open: false, role: null });

  const canEditUsers = hasRole(['super_admin', 'admin', 'hr']);
  const canDeleteUsers = hasRole(['super_admin']);
  const canManageRoles = hasRole(['super_admin', 'admin']);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data } = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch roles and permissions
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const [rolesRes, permsRes] = await Promise.all([
        getRoles(),
        getPermissionsByModule()
      ]);
      setRoles(rolesRes.data);
      setPermissionsByModule(permsRes.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // User handlers
  const handleUpdateUser = async (updates) => {
    try {
      await updateUser(editModal.user.id, updates);
      toast.success('User updated');
      setEditModal({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(deleteConfirm.user.id);
      toast.success('User deleted');
      setDeleteConfirm({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleToggleVerified = async (user) => {
    try {
      await updateUser(user.id, { email_verified: !user.email_verified });
      toast.success(user.email_verified ? 'Email unverified' : 'Email verified');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  };

  // Role handlers
  const handleOpenRoleModal = async (role) => {
    try {
      const { data } = await getRole(role.id);
      setRoleModal({ open: true, role: data, mode: 'view' });
    } catch (error) {
      toast.error('Failed to load role details');
    }
  };

  const handleDeleteRole = async () => {
    try {
      await deleteRole(deleteRoleConfirm.role.id);
      toast.success('Role deleted');
      setDeleteRoleConfirm({ open: false, role: null });
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete role');
    }
  };

  return (
    <div className="min-h-screen" data-testid="users-page">
      <Header title="Users & Roles" subtitle="Manage users and role-based access control" />
      
      <div className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-white data-[state=active]:text-black"
              data-testid="users-tab"
            >
              <UsersThree className="w-4 h-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:bg-white data-[state=active]:text-black"
              data-testid="roles-tab"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Roles ({roles.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
              {loadingUsers ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <UsersThree weight="duotone" className="w-12 h-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Active</th>
                        <th>Verified</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} data-testid={`user-row-${user.id}`}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white font-medium text-sm">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-xs text-zinc-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td><RoleBadge role={user.role} /></td>
                          <td>
                            <button
                              onClick={() => canEditUsers && handleToggleActive(user)}
                              disabled={!canEditUsers || user.id === currentUser?._id}
                              className={`p-1 rounded ${user.is_active ? 'text-green-500' : 'text-red-500'} ${canEditUsers && user.id !== currentUser?._id ? 'hover:bg-zinc-800 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                              data-testid={`toggle-active-${user.id}`}
                            >
                              {user.is_active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={() => canEditUsers && handleToggleVerified(user)}
                              disabled={!canEditUsers}
                              className={`p-1 rounded ${user.email_verified ? 'text-green-500' : 'text-red-500'} ${canEditUsers ? 'hover:bg-zinc-800 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                              data-testid={`toggle-verified-${user.id}`}
                            >
                              {user.email_verified ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                            </button>
                          </td>
                          <td className="text-zinc-500 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              {canEditUsers && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-white"
                                  onClick={() => setEditModal({ open: true, user })}
                                  data-testid={`edit-user-${user.id}`}
                                >
                                  <PencilSimple className="w-4 h-4" />
                                </Button>
                              )}
                              {canDeleteUsers && user.id !== currentUser?._id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-400"
                                  onClick={() => setDeleteConfirm({ open: true, user })}
                                  data-testid={`delete-user-${user.id}`}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            {canManageRoles && (
              <div className="flex justify-end">
                <Button 
                  className="bg-white text-black hover:bg-zinc-200"
                  onClick={() => setCreateRoleModal(true)}
                  data-testid="create-role-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
            )}
            
            {loadingRoles ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <div 
                    key={role.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-md p-5 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => handleOpenRoleModal(role)}
                    data-testid={`role-card-${role.name}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{role.display_name || role.name}</h3>
                        {role.is_system && (
                          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">System Role</span>
                        )}
                      </div>
                      <ShieldCheck weight="duotone" className="w-6 h-6 text-zinc-500" />
                    </div>
                    <p className="text-sm text-zinc-400 mb-3">{role.description || 'No description'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        {role.permissions?.length || 0} permissions
                      </span>
                      <span className="text-xs text-zinc-500">
                        {users.filter(u => u.role === role.name).length} users
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        open={editModal.open}
        user={editModal.user}
        roles={roles}
        onClose={() => setEditModal({ open: false, user: null })}
        onSave={handleUpdateUser}
      />

      {/* Delete User Confirmation */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => !open && setDeleteConfirm({ open: false, user: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Are you sure you want to delete <span className="text-white">{deleteConfirm.user?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, user: null })}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-user-btn"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Permissions Modal */}
      <RolePermissionsModal
        open={roleModal.open}
        role={roleModal.role}
        permissionsByModule={permissionsByModule}
        canEdit={canManageRoles}
        onClose={() => setRoleModal({ open: false, role: null, mode: 'view' })}
        onSave={async (permissions) => {
          try {
            await updateRolePermissions(roleModal.role.id, permissions);
            toast.success('Role permissions updated');
            setRoleModal({ open: false, role: null, mode: 'view' });
            fetchRoles();
          } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update permissions');
          }
        }}
        onDelete={() => {
          setRoleModal({ open: false, role: null, mode: 'view' });
          setDeleteRoleConfirm({ open: true, role: roleModal.role });
        }}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        open={createRoleModal}
        permissionsByModule={permissionsByModule}
        onClose={() => setCreateRoleModal(false)}
        onSave={async (data) => {
          try {
            await createRole(data);
            toast.success('Role created');
            setCreateRoleModal(false);
            fetchRoles();
          } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create role');
          }
        }}
      />

      {/* Delete Role Confirmation */}
      <Dialog open={deleteRoleConfirm.open} onOpenChange={(open) => !open && setDeleteRoleConfirm({ open: false, role: null })}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Role</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Are you sure you want to delete the role <span className="text-white">{deleteRoleConfirm.role?.display_name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteRoleConfirm({ open: false, role: null })}
              className="border-zinc-700 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteRole}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-role-btn"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Edit User Modal
const EditUserModal = ({ open, user, roles, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    is_active: false,
    email_verified: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || 'sales',
        is_active: user.is_active || false,
        email_verified: user.email_verified || false
      });
    }
  }, [user, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-zinc-950 border-zinc-800 text-white"
              data-testid="edit-user-name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Role</Label>
            <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="edit-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {roles.map((role) => (
                  <SelectItem key={role.name} value={role.name} className="text-zinc-300">
                    {role.display_name || role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active" className="text-zinc-300 cursor-pointer">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="email_verified"
                checked={formData.email_verified}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_verified: checked }))}
              />
              <Label htmlFor="email_verified" className="text-zinc-300 cursor-pointer">Email Verified</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-white text-black hover:bg-zinc-200" data-testid="save-user-btn">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Role Permissions Modal
const RolePermissionsModal = ({ open, role, permissionsByModule, canEdit, onClose, onSave, onDelete }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (role) {
      setSelectedPermissions(role.permissions || []);
      setIsEditing(false);
    }
  }, [role, open]);

  const handleTogglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleToggleModule = (module) => {
    const modulePermIds = permissionsByModule[module]?.map(p => p.id) || [];
    const allSelected = modulePermIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...modulePermIds])]);
    }
  };

  const isModuleFullySelected = (module) => {
    const modulePermIds = permissionsByModule[module]?.map(p => p.id) || [];
    return modulePermIds.length > 0 && modulePermIds.every(id => selectedPermissions.includes(id));
  };

  const isModulePartiallySelected = (module) => {
    const modulePermIds = permissionsByModule[module]?.map(p => p.id) || [];
    const selectedCount = modulePermIds.filter(id => selectedPermissions.includes(id)).length;
    return selectedCount > 0 && selectedCount < modulePermIds.length;
  };

  const filteredModules = Object.keys(permissionsByModule).filter(module => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    if (module.toLowerCase().includes(search)) return true;
    return permissionsByModule[module].some(p => 
      p.name.toLowerCase().includes(search) || 
      p.description?.toLowerCase().includes(search)
    );
  });

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ShieldCheck weight="duotone" className="w-5 h-5" />
            {role.display_name || role.name} - Permissions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Role Info */}
          <div className="p-3 bg-zinc-950 rounded-md">
            <p className="text-sm text-zinc-400">{role.description || 'No description'}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <span>{selectedPermissions.length} permissions selected</span>
              {role.is_system && <span className="text-yellow-500">System Role</span>}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-950 border-zinc-800 text-white"
            />
          </div>

          {/* Permissions by Module */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredModules.map(module => (
                <div key={module} className="border border-zinc-800 rounded-md overflow-hidden">
                  <div 
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 cursor-pointer hover:bg-zinc-800"
                    onClick={() => isEditing && handleToggleModule(module)}
                  >
                    {isEditing && (
                      <Checkbox
                        checked={isModuleFullySelected(module)}
                        className={isModulePartiallySelected(module) ? 'data-[state=checked]:bg-zinc-500' : ''}
                        onCheckedChange={() => handleToggleModule(module)}
                      />
                    )}
                    <span className="text-sm font-medium text-white capitalize">{module}</span>
                    <span className="text-xs text-zinc-500">
                      ({permissionsByModule[module]?.filter(p => selectedPermissions.includes(p.id)).length}/{permissionsByModule[module]?.length})
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {permissionsByModule[module]?.map(perm => (
                      <div 
                        key={perm.id}
                        className={`flex items-center gap-3 p-2 rounded ${isEditing ? 'cursor-pointer hover:bg-zinc-800/50' : ''}`}
                        onClick={() => isEditing && handleTogglePermission(perm.id)}
                      >
                        {isEditing ? (
                          <Checkbox
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => handleTogglePermission(perm.id)}
                          />
                        ) : (
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${selectedPermissions.includes(perm.id) ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-600'}`}>
                            {selectedPermissions.includes(perm.id) && <Check className="w-3 h-3" />}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-zinc-300">{perm.name}</p>
                          <p className="text-xs text-zinc-500">{perm.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!role.is_system && canEdit && !isEditing && (
            <Button
              variant="outline"
              onClick={() => onDelete()}
              className="border-red-500/50 text-red-500 hover:bg-red-500/10 mr-auto"
              data-testid="delete-role-btn"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Role
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
              {isEditing ? 'Cancel' : 'Close'}
            </Button>
            {canEdit && (
              isEditing ? (
                <Button 
                  onClick={() => onSave(selectedPermissions)} 
                  className="bg-white text-black hover:bg-zinc-200"
                  data-testid="save-permissions-btn"
                >
                  Save Permissions
                </Button>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-white text-black hover:bg-zinc-200"
                  data-testid="edit-permissions-btn"
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

// Create Role Modal
const CreateRoleModal = ({ open, permissionsByModule, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (open) {
      setFormData({ name: '', description: '', permissions: [] });
    }
  }, [open]);

  const handleTogglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Role</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Role Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-zinc-950 border-zinc-800 text-white"
              placeholder="e.g., Warehouse Manager"
              data-testid="new-role-name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-zinc-950 border-zinc-800 text-white"
              placeholder="Describe this role's responsibilities"
              data-testid="new-role-description"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Permissions ({formData.permissions.length} selected)</Label>
            <ScrollArea className="h-[300px] border border-zinc-800 rounded-md p-2">
              <div className="space-y-3">
                {Object.keys(permissionsByModule).map(module => (
                  <div key={module}>
                    <p className="text-xs font-medium text-zinc-500 uppercase mb-2">{module}</p>
                    <div className="space-y-1">
                      {permissionsByModule[module]?.map(perm => (
                        <div 
                          key={perm.id}
                          className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-zinc-800/50"
                          onClick={() => handleTogglePermission(perm.id)}
                        >
                          <Checkbox
                            checked={formData.permissions.includes(perm.id)}
                            onCheckedChange={() => handleTogglePermission(perm.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-zinc-300">{perm.name}</p>
                            <p className="text-xs text-zinc-500">{perm.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-white text-black hover:bg-zinc-200"
            data-testid="create-role-submit"
          >
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsersPage;
