'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Search, UserPlus, Shield, MoreHorizontal, Users } from 'lucide-react';

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

  const page = Number(searchParams.get('page') ?? '1') || 1;
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? 'all';

  // ✅ SAFE ROLE HANDLING
  const roleName = currentUser?.role?.name;
  const roleSlug = roleName?.toLowerCase() ?? 'admin';

  const adminBase = useMemo(() => {
    if (roleName === 'Admin') {
      return `/admin/${roleSlug}`;
    }
    return '';
  }, [roleName, roleSlug]);

  const queryArgs = useMemo(() => {
    const args: UsersQueryArgs = {
      page,
      limit: 15,
    };

    const trimmedSearch = search.trim();

    if (trimmedSearch) args.search = trimmedSearch;
    if (status !== 'all') args.status = status;

    return args;
  }, [page, search, status]);

  const { data, isLoading } = useGetAllUsersQuery(queryArgs);
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });

    if ('search' in updates || 'status' in updates) {
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
    await updateUserStatus({ userId: id, status: 'suspended' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user permanently?')) return;
    await deleteUser({ userId: id });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-sm text-muted-foreground">Manage users, roles and access</p>
          </div>
        </div>

        <Button asChild>
          <Link href={`${adminBase}/user/add`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-muted/40 p-3 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => updateQuery({ search: e.target.value || null })}
          />
        </div>

        <Select value={status} onValueChange={(value) => updateQuery({ status: value })}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="pending_verification">Pending</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center py-16 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium">No users found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u: UserProfile) => (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  {/* USER */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <div className="relative h-10 w-10 ring-2 ring-muted">
                          <Image
                            src={u.avatar_url}
                            alt={u.username}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {u.username?.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <Link
                          href={`/admin/${roleSlug}/user/${u.id}/stats`}
                          className="font-medium hover:underline"
                        >
                          {u.username}
                        </Link>
                        <p className="text-xs text-muted-foreground">{u.email || 'No email'}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Badge variant={statusVariant(u.status)} className="capitalize">
                      {u.status?.replaceAll('_', ' ')}
                    </Badge>
                  </TableCell>

                  {/* ROLE */}
                  <TableCell>
                    {u.role ? (
                      <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md text-xs w-fit">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        {u.role.name}
                      </div>
                    ) : (
                      '—'
                    )}
                  </TableCell>

                  {/* DATE */}
                  <TableCell className="text-sm text-muted-foreground">
                    {u.created_at
                      ? formatDistanceToNow(new Date(u.created_at), {
                          addSuffix: true,
                        })
                      : '—'}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/${roleSlug}/user/${u.id}/stats`}>📊 View Stats</Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleSuspend(u.id)}>
                          ⚠️ Suspend
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(u.id)}
                        >
                          🗑 Delete
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

      {/* PAGINATION */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.has_prev}
            onClick={() => updateQuery({ page: String(page - 1) })}
          >
            ← Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.total_pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.has_next}
            onClick={() => updateQuery({ page: String(page + 1) })}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
