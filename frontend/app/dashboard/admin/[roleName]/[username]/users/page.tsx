'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Search, UserPlus, Shield, MoreHorizontal } from 'lucide-react';

import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  type UserProfile,
} from '@/services/api/userApi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/store/AuthContext';
type UsersQueryArgs = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};
export default function UsersAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { user: currentUser } = useAuth();

  // ── Parse query params ────────────────────────────────
  const page = Number(searchParams.get('page') ?? '1') || 1;
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? 'all';

  const adminBase = useMemo(() => {
    if (currentUser?.role?.name === 'Admin') {
      return `/dashboard/admin/${currentUser.role.name.toLowerCase()}/${currentUser.username}`;
    }
    return '';
  }, [currentUser]);

  // ── Prepare clean query args (recommended pattern) ────
  const queryArgs = useMemo(() => {
    const args: UsersQueryArgs = {
      page,
      limit: 15,
    };

    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      args.search = trimmedSearch;
    }

    if (status !== 'all') {
      args.status = status;
    }

    return args;
  }, [page, search, status]);

  const { data, isLoading } = useGetAllUsersQuery(queryArgs);

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  // ── Update URL params helper ──────────────────────────
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change (good UX)
    const isFilterChange = 'search' in updates || 'status' in updates;
    if (isFilterChange) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const statusVariant = (status: UserProfile['status']) => {
    switch (status) {
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

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspend this user?')) return;
    try {
      await updateUserStatus({ userId: id, status: 'suspended' }).unwrap();
    } catch (err) {
      console.error('Suspend failed:', err);
      // ← TODO: toast notification
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.'))
      return;
    try {
      await deleteUser({ userId: id }).unwrap();
    } catch (err) {
      console.error('Delete failed:', err);
      // ← TODO: toast notification
    }
  };

  return (
    <DashboardShell>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Users</h1>

          <Button asChild>
            <Link href={`${adminBase}/user/add`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or email…"
              className="pl-9"
              value={search} // ← controlled
              onChange={(e) => updateQuery({ search: e.target.value || null })}
            />
          </div>

          <Select value={status} onValueChange={(value) => updateQuery({ status: value })}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending_verification">Pending Verification</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u: UserProfile) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <div className="relative h-10 w-10 shrink-0">
                            <Image
                              src={u.avatar_url}
                              alt={u.username}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                            {u.username?.slice(0, 2).toUpperCase() || '?'}
                          </div>
                        )}

                        <div className="min-w-0">
                          <Link
                            href={`/user/${u.id}/stats`}
                            className="font-medium hover:underline truncate block"
                          >
                            {u.username}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">{u.email || '—'}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusVariant(u.status)}>
                        {u.status?.replaceAll('_', ' ') || 'unknown'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {u.role ? (
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" />
                          {u.role.name || '—'}
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground text-sm">
                      {u.created_at
                        ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true })
                        : '—'}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/user/${u.id}/stats`}>View Stats</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSuspend(u.id)}>
                            Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(u.id)}
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={!pagination.has_prev}
              onClick={() => updateQuery({ page: String(page - 1) })}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.total_pages}
            </span>

            <Button
              variant="outline"
              disabled={!pagination.has_next}
              onClick={() => updateQuery({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
