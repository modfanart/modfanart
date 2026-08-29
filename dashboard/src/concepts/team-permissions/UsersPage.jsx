import React, { useMemo, useState } from 'react';

import {
  PencilSimple,
  Trash,
  ShieldCheck,
  Plus,
  MagnifyingGlass,
} from '@phosphor-icons/react';

import { Header } from '../../components/layout/Header';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

import { Label } from '../../components/ui/label';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';

import { Badge } from '../../components/ui/badge';

import { Loader2 } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '../../components/ui/pagination';

// RTK Query
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
  useCreateUserMutation,
} from '../../services/api/userApi';

import { UserFormModal } from '../../components/modals/UserFormModal';
import { RolePermissionsModal } from '../../components/modals/RolePermissionsModal';

import { useAuth } from '../../contexts/AuthContext';

import { toast } from 'sonner';

// ============================================================
// ROLE BADGE
// ============================================================

const RoleBadge = ({ role }) => {
  const roleColors = {
    super_admin: 'border-purple-500/50 text-purple-500',
    admin: 'border-red-500/50 text-red-500',
    developer: 'border-blue-500/50 text-blue-500',
    sales: 'border-green-500/50 text-green-500',
    hr: 'border-pink-500/50 text-pink-500',
    artist: 'border-blue-500/50 text-blue-500',
    brand_owner: 'border-orange-500/50 text-orange-500',
    brand_manager: 'border-yellow-500/50 text-yellow-500',
    default_user: 'border-zinc-700 text-zinc-400',
  };

  const roleName = role?.name?.toLowerCase();

  return (
    <span
      className={`inline-flex items-center border px-3 py-1 rounded-full text-sm ${roleColors[roleName] ||
        'border-zinc-700 text-zinc-400'
        } bg-zinc-950`}
    >
      {role?.display_name || role?.name || 'No Role'}
    </span>
  );
};

// ============================================================
// USERS PAGE
// ============================================================

export const UsersPage = () => {
  const { hasRole } = useAuth();

  // ==========================================================
  // TAB
  // ==========================================================

  const [activeTab, setActiveTab] = useState('users');

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState('');

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 20;

  // ==========================================================
  // USER MODALS
  // ==========================================================

  const [userModal, setUserModal] = useState({
    open: false,
    user: null,
  });

  const [deleteUserConfirm, setDeleteUserConfirm] = useState({
    open: false,
    user: null,
  });

  // ==========================================================
  // ROLE MODALS
  // ==========================================================

  const [roleModal, setRoleModal] = useState({
    open: false,
    role: null,
  });

  const [createRoleModal, setCreateRoleModal] = useState(false);

  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState({
    open: false,
    role: null,
  });

  const [selectedUserForRole, setSelectedUserForRole] =
    useState(null);

  const [newRole, setNewRole] = useState({
    name: '',
    hierarchy_level: 10,
    description: '',
  });

  // ==========================================================
  // USERS QUERY
  // ==========================================================

  const {
    data: usersData,
    isLoading: loadingUsers,
    isFetching: fetchingUsers,
  } = useGetAllUsersQuery({
    page: currentPage,
    limit: USERS_PER_PAGE,
    search: searchTerm.trim(),
  });

  // ==========================================================
  // ROLES QUERY
  // ==========================================================

  const { data: rolesData = [] } =
    useGetAllRolesQuery();

  // ==========================================================
  // MUTATIONS
  // ==========================================================

  const [createRole, { isLoading: isCreating }] =
    useCreateRoleMutation();

  const [updateRole] =
    useUpdateRoleMutation();

  const [deleteRole] =
    useDeleteRoleMutation();

  const [assignRoleToUser] =
    useAssignRoleToUserMutation();

  const [updateUser] =
    useUpdateUserMutation();

  const [deleteUser] =
    useDeleteUserMutation();

  const [
    createUser,
    { isLoading: isCreatingUser },
  ] = useCreateUserMutation();

  // ==========================================================
  // PERMISSIONS
  // ==========================================================

  const canManageUsers = hasRole([
    'SUPER_ADMIN',
    'ADMIN',
    'HR',
    'DEVELOPER',
  ]);

  const canManageRoles = hasRole([
    'SUPER_ADMIN',
    'ADMIN',
    'HR',
    'DEVELOPER',
  ]);

  // ==========================================================
  // DATA
  // ==========================================================

  const users = usersData?.users || [];

  const roles = rolesData || [];

  const pagination = usersData?.pagination || {
    page: 1,
    limit: USERS_PER_PAGE,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  };

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);

    // Search should always start from page 1
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.total_pages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (!pagination.has_prev || fetchingUsers) {
      return;
    }

    setCurrentPage((previous) => previous - 1);
  };

  const handleNextPage = () => {
    if (!pagination.has_next || fetchingUsers) {
      return;
    }

    setCurrentPage((previous) => previous + 1);
  };

  // ==========================================================
  // PAGE NUMBERS
  // ==========================================================

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.total_pages;

    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages = [];

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis-left');
    }

    const startPage = Math.max(
      2,
      currentPage - 1
    );

    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis-right');
    }

    pages.push(totalPages);

    return pages;
  }, [
    currentPage,
    pagination.total_pages,
  ]);

  // ==========================================================
  // CREATE USER
  // ==========================================================

  const handleCreateUser = async (data) => {
    try {
      await createUser(data).unwrap();

      toast.success('User created successfully');

      setUserModal({
        open: false,
        user: null,
      });
    } catch (err) {
      toast.error(
        err?.data?.message ||
        'Failed to create user'
      );
    }
  };

  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const handleUpdateUser = async (data) => {
    try {
      await updateUser(data).unwrap();

      toast.success('User updated successfully');

      setUserModal({
        open: false,
        user: null,
      });
    } catch (err) {
      toast.error(
        err?.data?.message ||
        'Failed to update user'
      );
    }
  };

  // ==========================================================
  // CREATE ROLE
  // ==========================================================

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      await createRole(newRole).unwrap();

      toast.success(
        'Role created successfully'
      );

      setCreateRoleModal(false);

      setNewRole({
        name: '',
        hierarchy_level: 10,
        description: '',
      });
    } catch (err) {
      toast.error(
        err?.data?.message ||
        'Failed to create role'
      );
    }
  };

  // ==========================================================
  // DELETE USER
  // ==========================================================

  const handleDeleteUser = async () => {
    if (!deleteUserConfirm.user) {
      return;
    }

    try {
      await deleteUser({
        userId: deleteUserConfirm.user.id,
      }).unwrap();

      toast.success(
        'User deleted successfully'
      );

      setDeleteUserConfirm({
        open: false,
        user: null,
      });
    } catch (err) {
      toast.error(
        err?.data?.message ||
        'Failed to delete user'
      );
    }
  };

  // ==========================================================
  // DELETE ROLE
  // ==========================================================

  const handleDeleteRole = async () => {
    if (!deleteRoleConfirm.role) {
      return;
    }

    try {
      await deleteRole(
        deleteRoleConfirm.role.id
      ).unwrap();

      toast.success(
        'Role deleted successfully'
      );

      setDeleteRoleConfirm({
        open: false,
        role: null,
      });
    } catch (err) {
      toast.error(
        err?.data?.message ||
        'Failed to delete role'
      );
    }
  };

  // ==========================================================
  // ASSIGN ROLE
  // ==========================================================

  const handleAssignRole = async (
    userId,
    roleId
  ) => {
    if (!userId || !roleId) {
      return;
    }

    try {
      await assignRoleToUser({
        userId,
        roleId,
      }).unwrap();

      toast.success(
        'Role assigned successfully'
      );

      setSelectedUserForRole(null);
    } catch (err) {
      toast.error(
        err?.data?.message ||
        'Failed to assign role'
      );
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen">

      <Header
        title="Users & Roles"
        subtitle="Manage users and role-based access control"
      />

      <div className="p-4 sm:p-6">

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >

          {/* ==================================================
              TABS
          ================================================== */}

          <TabsList className="bg-zinc-900 border border-zinc-800">

            <TabsTrigger value="users">
              Users ({pagination.total})
            </TabsTrigger>

            <TabsTrigger value="roles">
              Roles ({roles.length})
            </TabsTrigger>

          </TabsList>

          {/* ==================================================
              USERS TAB
          ================================================== */}

          <TabsContent value="users">

            {/* HEADER */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  All Users
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                  {pagination.total} total users
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                {/* SEARCH */}

                <div className="relative w-full sm:w-80">

                  <MagnifyingGlass
                    weight="bold"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
                  />

                  <Input
                    type="search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-9 pr-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-600"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-sm"
                    >
                      ×
                    </button>
                  )}

                </div>

                {/* ADD USER */}

                {canManageUsers && (
                  <Button
                    onClick={() =>
                      setUserModal({
                        open: true,
                        user: null,
                      })
                    }
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Add User
                  </Button>
                )}

              </div>

            </div>

            {/* SEARCH INFO */}

            {searchTerm.trim() && (
              <p className="text-sm text-zinc-500 mb-3">

                Search results for{' '}

                <span className="text-zinc-300">
                  "{searchTerm}"
                </span>

              </p>
            )}

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

              {loadingUsers ? (

                <div className="h-64 flex items-center justify-center">

                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />

                </div>

              ) : users.length === 0 ? (

                <div className="h-64 flex flex-col items-center justify-center text-center">

                  <MagnifyingGlass className="w-10 h-10 text-zinc-600 mb-3" />

                  <p className="text-zinc-300 font-medium">
                    {searchTerm
                      ? 'No users found'
                      : 'No users available'}
                  </p>

                  {searchTerm && (
                    <>
                      <p className="text-sm text-zinc-500 mt-1">
                        Try another username,
                        email, or role.
                      </p>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-zinc-400"
                        onClick={() => {
                          setSearchTerm('');
                          setCurrentPage(1);
                        }}
                      >
                        Clear search
                      </Button>
                    </>
                  )}

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b border-zinc-800">

                        <th className="text-left p-4 text-zinc-400 font-medium">
                          User
                        </th>

                        <th className="text-left p-4 text-zinc-400 font-medium">
                          Role
                        </th>

                        <th className="text-left p-4 text-zinc-400 font-medium">
                          Status
                        </th>

                        <th className="text-left p-4 text-zinc-400 font-medium">
                          Joined
                        </th>

                        <th className="text-right p-4 text-zinc-400 font-medium">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {users.map((user) => (

                        <tr
                          key={user.id}
                          className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                        >

                          {/* USER */}

                          <td className="p-4">

                            <div className="flex items-center gap-3">

                              <div className="w-9 h-9 shrink-0 rounded-full bg-zinc-700 flex items-center justify-center font-medium text-white">

                                {user.username
                                  ?.charAt(0)
                                  ?.toUpperCase() || '?'}

                              </div>

                              <div className="min-w-0">

                                <p className="font-medium text-white truncate">
                                  {user.username ||
                                    'Unnamed User'}
                                </p>

                                <p className="text-sm text-zinc-500 truncate">
                                  {user.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* ROLE */}

                          <td className="p-4">
                            <RoleBadge
                              role={user.role}
                            />
                          </td>

                          {/* STATUS */}

                          <td className="p-4">

                            <Badge
                              variant={
                                user.status ===
                                  'active'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {user.status}
                            </Badge>

                          </td>

                          {/* JOINED */}

                          <td className="p-4 text-zinc-500 whitespace-nowrap">

                            {user.created_at
                              ? new Date(
                                user.created_at
                              ).toLocaleDateString()
                              : '—'}

                          </td>

                          {/* ACTIONS */}

                          <td className="p-4 text-right whitespace-nowrap">

                            {canManageUsers && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setUserModal({
                                      open: true,
                                      user,
                                    })
                                  }
                                >
                                  <PencilSimple className="w-4 h-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-400"
                                  onClick={() =>
                                    setDeleteUserConfirm({
                                      open: true,
                                      user,
                                    })
                                  }
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedUserForRole(
                                  user
                                )
                              }
                            >
                              Change Role
                            </Button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {!loadingUsers &&
                pagination.total_pages > 1 && (

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-zinc-800">

                    {/* RESULTS */}

                    <div className="text-sm text-zinc-500">

                      Showing{' '}

                      <span className="text-zinc-300 font-medium">
                        {(pagination.page - 1) *
                          pagination.limit +
                          1}
                      </span>

                      {' '}to{' '}

                      <span className="text-zinc-300 font-medium">
                        {Math.min(
                          pagination.page *
                          pagination.limit,
                          pagination.total
                        )}
                      </span>

                      {' '}of{' '}

                      <span className="text-zinc-300 font-medium">
                        {pagination.total}
                      </span>

                      {' '}users

                    </div>

                    {/* PAGINATION */}

                    <Pagination className="mx-0 w-auto">

                      <PaginationContent>

                        {/* PREVIOUS */}

                        <PaginationItem>

                          <PaginationPrevious
                            disabled={
                              !pagination.has_prev ||
                              fetchingUsers
                            }
                            onClick={
                              handlePreviousPage
                            }
                          />

                        </PaginationItem>

                        {/* PAGE NUMBERS */}

                        {pageNumbers.map(
                          (page) => {

                            if (
                              page ===
                              'ellipsis-left'
                            ) {
                              return (
                                <PaginationItem
                                  key={page}
                                >
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            if (
                              page ===
                              'ellipsis-right'
                            ) {
                              return (
                                <PaginationItem
                                  key={page}
                                >
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            return (
                              <PaginationItem
                                key={page}
                              >
                                <PaginationLink
                                  isActive={
                                    currentPage ===
                                    page
                                  }
                                  disabled={
                                    fetchingUsers
                                  }
                                  onClick={() =>
                                    handlePageChange(
                                      page
                                    )
                                  }
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                        )}

                        {/* NEXT */}

                        <PaginationItem>

                          <PaginationNext
                            disabled={
                              !pagination.has_next ||
                              fetchingUsers
                            }
                            onClick={
                              handleNextPage
                            }
                          />

                        </PaginationItem>

                      </PaginationContent>

                    </Pagination>

                  </div>

                )}

            </div>

          </TabsContent>

          {/* ==================================================
              ROLES TAB
          ================================================== */}

          <TabsContent value="roles">

            {canManageRoles && (
              <div className="flex justify-end mb-4">

                <Button
                  onClick={() =>
                    setCreateRoleModal(true)
                  }
                >
                  <Plus className="mr-2 w-4 h-4" />
                  New Role
                </Button>

              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {roles.map((role) => (

                <div
                  key={role.id}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors"
                  onClick={() =>
                    setRoleModal({
                      open: true,
                      role,
                    })
                  }
                >

                  <div className="flex justify-between">

                    <h3 className="text-lg font-semibold text-white">
                      {role.display_name ||
                        role.name}
                    </h3>

                    <ShieldCheck className="w-6 h-6 text-zinc-500" />

                  </div>

                  <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                    {role.description}
                  </p>

                  <div className="mt-4 text-xs text-zinc-500 flex justify-between">

                    <span>
                      Level {role.hierarchy_level}
                    </span>

                    <span>
                      {role.permissions?.length ||
                        0}{' '}
                      perms
                    </span>

                  </div>

                </div>

              ))}

            </div>

          </TabsContent>

        </Tabs>

      </div>

      {/* ======================================================
          USER FORM MODAL
      ====================================================== */}

      <UserFormModal
        open={userModal.open}
        user={userModal.user}
        roles={roles}
        onClose={() =>
          setUserModal({
            open: false,
            user: null,
          })
        }
        onSave={
          userModal.user
            ? handleUpdateUser
            : handleCreateUser
        }
        isLoading={isCreatingUser}
      />

      {/* ======================================================
          ROLE PERMISSIONS MODAL
      ====================================================== */}

      <RolePermissionsModal
        open={roleModal.open}
        role={roleModal.role}
        onClose={() =>
          setRoleModal({
            open: false,
            role: null,
          })
        }
        onDelete={() => {
          setRoleModal({
            open: false,
            role: null,
          });

          setDeleteRoleConfirm({
            open: true,
            role: roleModal.role,
          });
        }}
      />

      {/* ======================================================
          CREATE ROLE
      ====================================================== */}

      <Dialog
        open={createRoleModal}
        onOpenChange={(open) =>
          !open &&
          setCreateRoleModal(false)
        }
      >

        <DialogContent className="bg-zinc-900 border-zinc-800">

          <DialogHeader>

            <DialogTitle className="text-white">
              Create New Role
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4">

            <div>

              <Label>Role Name</Label>

              <Input
                value={newRole.name}
                onChange={(e) =>
                  setNewRole((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />

            </div>

            <div>

              <Label>
                Hierarchy Level
              </Label>

              <Input
                type="number"
                value={
                  newRole.hierarchy_level
                }
                onChange={(e) =>
                  setNewRole((prev) => ({
                    ...prev,
                    hierarchy_level:
                      Number(e.target.value),
                  }))
                }
              />

            </div>

            <div>

              <Label>Description</Label>

              <Input
                value={newRole.description}
                onChange={(e) =>
                  setNewRole((prev) => ({
                    ...prev,
                    description:
                      e.target.value,
                  }))
                }
              />

            </div>

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setCreateRoleModal(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleCreateRole}
              disabled={isCreating}
            >

              {isCreating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Create Role

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* ======================================================
          DELETE USER
      ====================================================== */}

      <Dialog
        open={deleteUserConfirm.open}
        onOpenChange={(open) =>
          !open &&
          setDeleteUserConfirm({
            open: false,
            user: null,
          })
        }
      >

        <DialogContent className="bg-zinc-900 border-zinc-800">

          <DialogHeader>

            <DialogTitle className="text-white">
              Delete User
            </DialogTitle>

          </DialogHeader>

          <p className="text-zinc-300">

            Are you sure you want to delete{' '}

            <strong className="text-white">
              {deleteUserConfirm.user?.username}
            </strong>

            ?

          </p>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setDeleteUserConfirm({
                  open: false,
                  user: null,
                })
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              Delete
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* ======================================================
          DELETE ROLE
      ====================================================== */}

      <Dialog
        open={deleteRoleConfirm.open}
        onOpenChange={(open) =>
          !open &&
          setDeleteRoleConfirm({
            open: false,
            role: null,
          })
        }
      >

        <DialogContent className="bg-zinc-900 border-zinc-800">

          <DialogHeader>

            <DialogTitle className="text-white">
              Delete Role
            </DialogTitle>

          </DialogHeader>

          <p className="text-zinc-300">

            Delete role{' '}

            <strong className="text-white">
              {deleteRoleConfirm.role?.name}
            </strong>

            ?

          </p>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setDeleteRoleConfirm({
                  open: false,
                  role: null,
                })
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteRole}
            >
              Delete
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

      {/* ======================================================
          ASSIGN ROLE
      ====================================================== */}

      <Dialog
        open={!!selectedUserForRole}
        onOpenChange={() =>
          setSelectedUserForRole(null)
        }
      >

        <DialogContent className="bg-zinc-900 border-zinc-800">

          <DialogHeader>

            <DialogTitle className="text-white">
              Change Role for @
              {selectedUserForRole?.username}
            </DialogTitle>

          </DialogHeader>

          <Select
            onValueChange={(roleId) =>
              handleAssignRole(
                selectedUserForRole?.id,
                roleId
              )
            }
          >

            <SelectTrigger>

              <SelectValue placeholder="Select role" />

            </SelectTrigger>

            <SelectContent>

              {roles.map((role) => (

                <SelectItem
                  key={role.id}
                  value={role.id}
                >
                  {role.name} (Level{' '}
                  {role.hierarchy_level})
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

