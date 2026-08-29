import React, { useMemo, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Plus,
  MagnifyingGlass,
  Palette,
  PencilSimple,
  Trash,
  Clock,
  Eye,
  DotsThreeVertical,
  SquaresFour,
  List,
  UserCircle,
  ShieldWarning,
  UsersThree,
} from '@phosphor-icons/react';

import {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
} from '../../services/api/rolesApi';

import { Header } from '../../components/layout/Header';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

import { Badge } from '../../components/ui/badge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

import {
  useGetUsersByRoleSlugQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} from '../../services/api/userApi';

import { UserFormModal } from '../../components/modals/UserFormModal';

import { useAuth } from '../../contexts/AuthContext';

import { toast } from 'sonner';

export const ArtistsList = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { hasRole } = useAuth();

  // ============================================================
  // PERMISSIONS
  // ============================================================

  const canManageArtists = hasRole([
    'SUPER_ADMIN',
    'ADMIN',
    'DEVELOPER',
  ]);

  // ============================================================
  // QUERY PARAMS
  // ============================================================

  const page = parseInt(searchParams.get('page') || '1', 10);

  const search = searchParams.get('search') || '';

  const status = searchParams.get('status') || 'all';

  const view = searchParams.get('view') || 'table';

  // ============================================================
  // API
  // ============================================================

  const { data: rolesData = [] } = useGetAllRolesQuery();

  const roles = rolesData || [];

  const queryArgs = useMemo(
    () => ({
      roleSlug: 'ARTIST',
      page,
      limit: 15,
      ...(search.trim() && {
        search: search.trim(),
      }),
      ...(status !== 'all' && {
        status,
      }),
    }),
    [page, search, status],
  );

  const {
    data,
    isLoading,
    isFetching,
  } = useGetUsersByRoleSlugQuery(queryArgs, {
    skip: !canManageArtists,
  });

  // ============================================================
  // MUTATIONS
  // ============================================================

  const [createUser, { isLoading: creating }] =
    useCreateUserMutation();

  const [updateUser, { isLoading: updating }] =
    useUpdateUserMutation();

  const [updateUserStatus] =
    useUpdateUserStatusMutation();

  const [deleteUser] =
    useDeleteUserMutation();

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedArtist, setSelectedArtist] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    artist: null,
  });

  const [suspendConfirm, setSuspendConfirm] = useState({
    open: false,
    artist: null,
  });

  // ============================================================
  // DATA
  // ============================================================

  const artists = data?.users ?? [];

  const pagination = data?.pagination;

  // ============================================================
  // QUERY UPDATE
  // ============================================================

  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (
      Object.prototype.hasOwnProperty.call(updates, 'search') ||
      Object.prototype.hasOwnProperty.call(updates, 'status')
    ) {
      params.set('page', '1');
    }

    setSearchParams(params, {
      replace: true,
    });
  };

  // ============================================================
  // STATUS
  // ============================================================

  const statusVariant = (value) => {
    switch (value) {
      case 'active':
        return 'default';

      case 'suspended':
        return 'destructive';

      case 'pending_verification':
        return 'secondary';

      case 'deactivated':
        return 'outline';

      default:
        return 'outline';
    }
  };

  const formatStatus = (value) => {
    if (!value) return 'Unknown';

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      );
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getInitials = (username) => {
    return username
      ? username.slice(0, 2).toUpperCase()
      : '??';
  };

  const formatJoinedDate = (date) => {
    if (!date) return '—';

    return new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const openCreate = () => {
    setSelectedArtist(null);
    setModalOpen(true);
  };

  const openEdit = (artist) => {
    setSelectedArtist(artist);
    setModalOpen(true);
  };

  const handleSuspend = async (artist) => {
    if (!artist) return;

    try {
      await updateUserStatus({
        userId: artist.id,
        status: 'suspended',
      }).unwrap();

      toast.success(
        `@${artist.username} has been suspended`,
      );

      setSuspendConfirm({
        open: false,
        artist: null,
      });
    } catch (error) {
      toast.error(
        error?.data?.message ||
        'Failed to suspend artist',
      );
    }
  };

  const handleDelete = async (artist) => {
    if (!artist) return;

    try {
      await deleteUser({
        userId: artist.id,
      }).unwrap();

      toast.success(
        `@${artist.username} has been deleted`,
      );

      setDeleteConfirm({
        open: false,
        artist: null,
      });
    } catch (error) {
      toast.error(
        error?.data?.message ||
        'Failed to delete artist',
      );
    }
  };

  const handleSave = async (payload) => {
    try {
      if (selectedArtist) {
        await updateUser({
          userId: selectedArtist.id,
          ...payload,
        }).unwrap();

        toast.success(
          'Artist updated successfully',
        );
      } else {
        await createUser(payload).unwrap();

        toast.success(
          'Artist invited successfully',
        );
      }

      setModalOpen(false);
    } catch (error) {
      toast.error(
        error?.data?.message ||
        'Operation failed',
      );
    }
  };

  // ============================================================
  // ACCESS DENIED
  // ============================================================

  if (!canManageArtists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
              <ShieldWarning
                size={28}
                weight="duotone"
                className="text-destructive"
              />
            </div>

            <h2 className="text-xl font-semibold">
              Access Denied
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You don't have permission to manage artists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // LOADING SKELETON
  // ============================================================

  const LoadingState = () => (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-xl border bg-muted/40"
        />
      ))}
    </div>
  );

  // ============================================================
  // EMPTY STATE
  // ============================================================

  const EmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <Palette
            size={30}
            weight="duotone"
            className="text-muted-foreground"
          />
        </div>

        <h3 className="text-lg font-semibold">
          No artists found
        </h3>

        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {search || status !== 'all'
            ? 'Try changing your search or filters.'
            : 'Start building your artist community by inviting your first artist.'}
        </p>

        {!search && status === 'all' && (
          <Button
            className="mt-6"
            onClick={openCreate}
          >
            <Plus size={17} />
            Invite First Artist
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // ============================================================
  // ARTIST AVATAR
  // ============================================================

  const ArtistAvatar = ({
    artist,
    size = 'default',
  }) => (
    <Avatar
      className={
        size === 'small'
          ? 'h-9 w-9'
          : 'h-11 w-11'
      }
    >
      <AvatarImage
        src={artist.avatar_url}
        alt={artist.username}
      />

      <AvatarFallback>
        {getInitials(artist.username)}
      </AvatarFallback>
    </Avatar>
  );

  // ============================================================
  // ARTIST ACTION MENU
  // ============================================================

  const ArtistActions = ({
    artist,
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <DotsThreeVertical size={18} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44"
      >
        <DropdownMenuItem
          onClick={() =>
            navigate(`/artist/${artist.id}`)
          }
        >
          <Eye size={16} />
          View Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => openEdit(artist)}
        >
          <PencilSimple size={16} />
          Edit Artist
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {artist.status !== 'suspended' && (
          <DropdownMenuItem
            className="text-amber-600 focus:text-amber-600"
            onClick={() =>
              setSuspendConfirm({
                open: true,
                artist,
              })
            }
          >
            <ShieldWarning size={16} />
            Suspend
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() =>
            setDeleteConfirm({
              open: true,
              artist,
            })
          }
        >
          <Trash size={16} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ============================================================
  // TABLE VIEW
  // ============================================================

  const TableView = () => (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[340px]">
              Artist
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Joined
            </TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {artists.map((artist) => (
            <TableRow
              key={artist.id}
              className="group"
            >
              {/* Artist */}

              <TableCell>
                <div className="flex items-center gap-3">
                  <ArtistAvatar
                    artist={artist}
                    size="small"
                  />

                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/artist/${artist.id}`,
                        )
                      }
                      className="max-w-[260px] truncate text-left font-medium hover:underline"
                    >
                      @{artist.username}
                    </button>

                    <p className="max-w-[280px] truncate text-sm text-muted-foreground">
                      {artist.email}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Status */}

              <TableCell>
                <Badge
                  variant={statusVariant(
                    artist.status,
                  )}
                  className="font-medium"
                >
                  {formatStatus(
                    artist.status,
                  )}
                </Badge>
              </TableCell>

              {/* Joined */}

              <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={15} />

                  {formatJoinedDate(
                    artist.created_at,
                  )}
                </div>
              </TableCell>

              {/* Actions */}

              <TableCell className="text-right">
                <ArtistActions
                  artist={artist}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  // ============================================================
  // CARD VIEW
  // ============================================================

  const CardView = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {artists.map((artist) => (
        <Card
          key={artist.id}
          className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <CardContent className="p-5">

            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <ArtistAvatar artist={artist} />

                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/artist/${artist.id}`,
                      )
                    }
                    className="block max-w-[180px] truncate font-semibold hover:underline"
                  >
                    @{artist.username}
                  </button>

                  <p className="max-w-[190px] truncate text-sm text-muted-foreground">
                    {artist.email}
                  </p>
                </div>
              </div>

              <ArtistActions
                artist={artist}
              />
            </div>

            {/* Status */}

            <div className="mt-5">
              <Badge
                variant={statusVariant(
                  artist.status,
                )}
              >
                {formatStatus(
                  artist.status,
                )}
              </Badge>
            </div>

            {/* Meta */}

            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} />

              <span>
                Joined{' '}
                {formatJoinedDate(
                  artist.created_at,
                )}
              </span>
            </div>

            {/* Actions */}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    `/artist/${artist.id}`,
                  )
                }
              >
                <Eye size={16} />
                View Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  openEdit(artist)
                }
              >
                <PencilSimple size={16} />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div
      className="min-h-screen bg-background"
      data-testid="artists-admin-page"
    >
      <Header
        title="Artists"
        subtitle={`${pagination?.total ?? artists.length} total artists`}
      />

      <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* ======================================================
            TOP BAR
        ======================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Artist Directory
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage artists, accounts and permissions.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="w-full sm:w-auto"
          >
            <Plus size={17} />
            Invite Artist
          </Button>
        </div>

        {/* ======================================================
            STATS
        ======================================================= */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Artists
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {pagination?.total ??
                    artists.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <UsersThree
                  size={20}
                  className="text-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {artists.filter(
                    (artist) =>
                      artist.status === 'active',
                  ).length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <UserCircle
                  size={20}
                  className="text-emerald-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Suspended
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {artists.filter(
                    (artist) =>
                      artist.status === 'suspended',
                  ).length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <ShieldWarning
                  size={20}
                  className="text-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Current Page
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {artists.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <Palette
                  size={20}
                  className="text-purple-500"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ======================================================
            FILTERS
        ======================================================= */}

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              {/* Search */}

              <div className="relative flex-1">
                <MagnifyingGlass
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <Input
                  placeholder="Search by username or email..."
                  value={search}
                  onChange={(event) =>
                    updateQuery({
                      search:
                        event.target.value ||
                        null,
                    })
                  }
                  className="pl-9"
                />
              </div>

              {/* Status */}

              <select
                value={status}
                onChange={(event) =>
                  updateQuery({
                    status:
                      event.target.value,
                  })
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="active">
                  Active
                </option>

                <option value="suspended">
                  Suspended
                </option>

                <option value="pending_verification">
                  Pending Verification
                </option>

                <option value="deactivated">
                  Deactivated
                </option>
              </select>

              {/* View Switcher */}

              <div className="flex items-center rounded-lg border bg-muted/50 p-1">

                <Button
                  type="button"
                  variant={
                    view === 'table'
                      ? 'secondary'
                      : 'ghost'
                  }
                  size="sm"
                  className="h-8 px-3"
                  onClick={() =>
                    updateQuery({
                      view: 'table',
                    })
                  }
                >
                  <List size={16} />
                  <span className="hidden sm:inline">
                    Table
                  </span>
                </Button>

                <Button
                  type="button"
                  variant={
                    view === 'cards'
                      ? 'secondary'
                      : 'ghost'
                  }
                  size="sm"
                  className="h-8 px-3"
                  onClick={() =>
                    updateQuery({
                      view: 'cards',
                    })
                  }
                >
                  <SquaresFour size={16} />
                  <span className="hidden sm:inline">
                    Cards
                  </span>
                </Button>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======================================================
            CONTENT
        ======================================================= */}

        <div className="relative">

          {/* Keep existing content visible during
              background refetches */}

          {isLoading ? (
            <LoadingState />
          ) : artists.length === 0 ? (
            <EmptyState />
          ) : view === 'cards' ? (
            <CardView />
          ) : (
            <TableView />
          )}

          {isFetching && !isLoading && (
            <div className="pointer-events-none absolute right-3 top-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
            </div>
          )}
        </div>

        {/* ======================================================
            PAGINATION
        ======================================================= */}

        {pagination &&
          pagination.total_pages > 1 && (
            <Card>
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-muted-foreground">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {artists.length}
                  </span>{' '}
                  artists
                  {' · '}
                  Page{' '}
                  <span className="font-medium text-foreground">
                    {pagination.page}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-foreground">
                    {pagination.total_pages}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.has_prev}
                    onClick={() =>
                      updateQuery({
                        page: page - 1,
                      })
                    }
                  >
                    Previous
                  </Button>

                  <div className="hidden min-w-20 items-center justify-center text-sm font-medium sm:flex">
                    {pagination.page} /{' '}
                    {pagination.total_pages}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.has_next}
                    onClick={() =>
                      updateQuery({
                        page: page + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>

              </CardContent>
            </Card>
          )}

      </main>

      {/* ========================================================
          DELETE DIALOG
      ========================================================= */}

      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirm({
              open: false,
              artist: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Artist
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm leading-6 text-muted-foreground">
              Are you sure you want to permanently
              delete{' '}
              <strong className="text-foreground">
                @{deleteConfirm.artist?.username}
              </strong>
              ?
            </p>

            <p className="mt-2 text-sm text-destructive">
              This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteConfirm({
                  open: false,
                  artist: null,
                })
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={!deleteConfirm.artist}
              onClick={() =>
                handleDelete(
                  deleteConfirm.artist,
                )
              }
            >
              <Trash size={16} />
              Delete Artist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          SUSPEND DIALOG
      ========================================================= */}

      <Dialog
        open={suspendConfirm.open}
        onOpenChange={(open) => {
          if (!open) {
            setSuspendConfirm({
              open: false,
              artist: null,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Suspend Artist
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm leading-6 text-muted-foreground">
              Are you sure you want to suspend{' '}
              <strong className="text-foreground">
                @{suspendConfirm.artist?.username}
              </strong>
              ?
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              The artist will no longer be able to
              use their account normally.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setSuspendConfirm({
                  open: false,
                  artist: null,
                })
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!suspendConfirm.artist}
              onClick={() =>
                handleSuspend(
                  suspendConfirm.artist,
                )
              }
            >
              <ShieldWarning size={16} />
              Suspend Artist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================
          ARTIST FORM
      ========================================================= */}

      <UserFormModal
        open={modalOpen}
        user={selectedArtist}
        roles={roles}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        isLoading={creating || updating}
        defaultRole="ARTIST"
      />
    </div>
  );
};

export default ArtistsList;

