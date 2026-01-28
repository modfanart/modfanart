import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table'
import { data10 } from './data'
import type { Person } from './data'
import type { ColumnDef } from '@tanstack/react-table'

const { Tr, Th, Td, THead, TBody } = Table

const Group = () => {
    const [data] = useState(() => data10)

    const columns = useMemo<ColumnDef<Person>[]>(
        () => [
            {
                header: 'نام',
                columns: [
                    {
                        header: 'نام کوچک',
                        accessorKey: 'firstName',
                    },
                    {
                        header: 'نام خانوادگی',
                        accessorKey: 'lastName',
                    },
                ],
            },
            {
                header: 'اطلاعات',
                columns: [
                    {
                        header: 'ایمیل',
                        accessorKey: 'email',
                        width: 50,
                    },
                    {
                        header: 'بازدیدها',
                        accessorKey: 'gender',
                        width: 60,
                    },
                ],
            },
        ],
        [],
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Table>
            <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <Th key={header.id} colSpan={header.colSpan}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </Th>
                            )
                        })}
                    </Tr>
                ))}
            </THead>
            <TBody>
                {table.getRowModel().rows.map((row) => {
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
    )
}

export default Group
