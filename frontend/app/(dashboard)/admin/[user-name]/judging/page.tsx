'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Search, UserPlus, ShieldCheck, MoreHorizontal } from 'lucide-react';

import {
  useGetUsersByRoleSlugQuery,
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

import { useAuth } from '@/store/AuthContext';

export default function JudgesAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { user: currentUser } = useAuth();

  const page = Number(searchParams.get('page') ?? '1') || 1;
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? 'all';

  const roleName = currentUser?.role?.name?.toLowerCase() ?? 'admin';
  const adminBase = roleName === 'admin' ? `/admin/${roleName}` : '';

  const queryArgs = useMemo(
    () => ({
      roleSlug: 'judge', // ← Key change: Judge role
      page,
      limit: 15,
      ...(search.trim() && { search: search.trim() }),
      ...(status !== 'all' && { status }),
    }),
    [page, search, status]
  );

  const { data, isLoading, isFetching } = useGetUsersByRoleSlugQuery(queryArgs);

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const judges = data?.users ?? [];
  const pagination = data?.pagination;

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
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
    if (!confirm('Suspend this judge?')) return;
    await updateUserStatus({ userId: id, status: 'suspended' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this judge permanently?')) return;
    await deleteUser({ userId: id });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Judges</h1>
            <p className="text-sm text-muted-foreground">Manage all contest judges</p>
          </div>
        </div>

        <Button asChild>
          <Link href={`${adminBase}/user/add`}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Judge
          </Link>
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-muted/40 p-3 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search judges by username or email..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => updateQuery({ search: e.target.value || null })}
          />
        </div>

        <Select value={status} onValueChange={(value) => updateQuery({ status: value })}>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
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
              <TableHead>Judge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading || isFetching ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-12 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : judges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="flex flex-col items-center py-16 text-center">
                    <ShieldCheck className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium">No judges found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search ? 'Try adjusting your search' : 'No judges registered yet'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              judges.map((judge: UserProfile) => (
                <TableRow key={judge.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {judge.avatar_url ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-muted">
                          <Image
                            src={judge.avatar_url}
                            alt={judge.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {judge.username?.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <Link
                          href={`/admin/${roleName}/judge/${judge.id}/monitor`}
                          className="font-medium hover:underline"
                        >
                          @{judge.username}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                          {judge.email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusVariant(judge.status)} className="capitalize">
                      {judge.status?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {judge.created_at
                      ? formatDistanceToNow(new Date(judge.created_at), { addSuffix: true })
                      : '—'}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/${roleName}/judge/${judge.id}/monitor`}>
                            📋 Monitor Activity
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => handleSuspend(judge.id)}>
                          ⚠️ Suspend Judge
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(judge.id)}
                        >
                          🗑️ Delete Judge
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
        <div className="flex justify-center items-center gap-6 mt-10">
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
