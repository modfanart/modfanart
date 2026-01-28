import { useState } from 'react'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, ColumnSort } from '@tanstack/react-table'

type Person = {
    firstName: string
    lastName: string
    age: number
    visits: number
    progress: number
    status: string
}

const columns: ColumnDef<Person>[] = [
    {
        header: 'نام',
        accessorKey: 'firstName',
    },
    {
        header: 'نام خانوادگی',
        accessorKey: 'lastName',
    },
    {
        header: 'سن',
        accessorKey: 'age',
    },
    {
        header: 'بازدیدها',
        accessorKey: 'visits',
    },
    {
        header: 'وضعیت',
        accessorKey: 'status',
    },
    {
        header: 'پیشرفت پروفایل',
        accessorKey: 'progress',
    },
]

const data = [
    {
        firstName: 'ماریا',
        lastName: 'آندرس',
        age: 24,
        visits: 28,
        progress: 56,
        status: 'پیچیده',
    },
    {
        firstName: 'فرانسیسکو',
        lastName: 'چانگ',
        age: 9,
        visits: 90,
        progress: 77,
        status: 'مجرد',
    },
    {
        firstName: 'رولند',
        lastName: 'مندل',
        age: 1,
        visits: 16,
        progress: 56,
        status: 'مجرد',
    },
    {
        firstName: 'هلن',
        lastName: 'بنت',
        age: 43,
        visits: 94,
        progress: 53,
        status: 'مجرد',
    },
    {
        firstName: 'یوشی',
        lastName: 'تناموری',
        age: 37,
        visits: 85,
        progress: 28,
        status: 'مجرد',
    },
]


const { Tr, Th, Td, THead, TBody, Sorter } = Table

const Sorting = () => {
    const [sorting, setSorting] = useState<ColumnSort[]>([])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <>
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className:
                                                        header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                    onClick:
                                                        header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {
                                                    <Sorter
                                                        sort={header.column.getIsSorted()}
                                                    />
                                                }
                                            </div>
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table
                        .getRowModel()
                        .rows.slice(0, 10)
                        .map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Td>
                                        )
                                    })}
                                </Tr>
                            )
                        })}
                </TBody>
            </Table>
        </>
    )
}

export default Sorting
