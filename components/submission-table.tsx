'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
type Submission = {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'licensed';
  submittedAt: string;
  updatedAt: string;
};

const data: Submission[] = [
  {
    id: 'SUBMISSION-001',
    title: 'Futuristic Robot Warrior',
    category: 'Character Art',
    status: 'pending',
    submittedAt: '2023-03-15T12:30:00Z',
    updatedAt: '2023-03-15T12:30:00Z',
  },
  {
    id: 'SUBMISSION-002',
    title: 'Space Princess Portrait',
    category: 'Character Art',
    status: 'pending',
    submittedAt: '2023-03-14T09:15:00Z',
    updatedAt: '2023-03-14T09:15:00Z',
  },
  {
    id: 'SUBMISSION-003',
    title: 'Dragon Rider Scene',
    category: 'Illustration',
    status: 'approved',
    submittedAt: '2023-03-12T15:45:00Z',
    updatedAt: '2023-03-13T10:20:00Z',
  },
  {
    id: 'SUBMISSION-004',
    title: 'Cyberpunk City Skyline',
    category: 'Environment Art',
    status: 'licensed',
    submittedAt: '2023-03-10T11:00:00Z',
    updatedAt: '2023-03-12T14:30:00Z',
  },
  {
    id: 'SUBMISSION-005',
    title: 'Fantasy Castle Landscape',
    category: 'Environment Art',
    status: 'rejected',
    submittedAt: '2023-03-08T16:20:00Z',
    updatedAt: '2023-03-09T09:45:00Z',
  },
  {
    id: 'SUBMISSION-006',
    title: 'Superhero Team Lineup',
    category: 'Illustration',
    status: 'approved',
    submittedAt: '2023-03-07T13:10:00Z',
    updatedAt: '2023-03-08T11:30:00Z',
  },
  {
    id: 'SUBMISSION-007',
    title: 'Magical Forest Path',
    category: 'Environment Art',
    status: 'licensed',
    submittedAt: '2023-03-05T10:50:00Z',
    updatedAt: '2023-03-10T15:15:00Z',
  },
  {
    id: 'SUBMISSION-008',
    title: 'Steampunk Airship',
    category: 'Concept Art',
    status: 'pending',
    submittedAt: '2023-03-04T09:30:00Z',
    updatedAt: '2023-03-04T09:30:00Z',
  },
  {
    id: 'SUBMISSION-009',
    title: 'Space Battle Scene',
    category: 'Illustration',
    status: 'approved',
    submittedAt: '2023-03-02T14:20:00Z',
    updatedAt: '2023-03-03T10:10:00Z',
  },
  {
    id: 'SUBMISSION-010',
    title: 'Fantasy Creature Design',
    category: 'Character Art',
    status: 'rejected',
    submittedAt: '2023-03-01T11:40:00Z',
    updatedAt: '2023-03-02T13:25:00Z',
  },
];

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <div>{row.getValue('category')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Submission['status'];

      const config = {
        pending: {
          label: 'Pending',
          variant: 'outline' as const,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        },
        approved: {
          label: 'Approved',
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800',
        },
        licensed: {
          label: 'Licensed',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800',
        },
        rejected: { label: 'Rejected', variant: 'destructive' as const, className: '' },
      }[status];

      return (
        <Badge variant={config.variant} className={cn(config.className)}>
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'submittedAt',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Submitted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('submittedAt'));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Updated
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const submission = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(submission.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View submission</DropdownMenuItem>
            <DropdownMenuItem>View license details</DropdownMenuItem>
            <DropdownMenuItem>Contact artist</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface SubmissionTableProps {
  filter?: string;
}

export function SubmissionTable({ filter }: SubmissionTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Apply filter if provided
  React.useEffect(() => {
    if (filter) {
      setColumnFilters([
        {
          id: 'status',
          value: [filter],
        },
      ]);
    } else {
      setColumnFilters([]);
    }
  }, [filter]);

  const filteredData = filter ? data.filter((item) => item.status === filter) : data;

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter submissions..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
