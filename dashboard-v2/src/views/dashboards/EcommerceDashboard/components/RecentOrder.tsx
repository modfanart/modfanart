import { useCallback } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { NumericFormat } from 'react-number-format'
import jalaliMoment from 'jalali-moment'

import type { Order } from '../types'

type RecentOrderProps = {
    data: Order[]
}
const { Tr, Td, TBody, THead, Th } = Table

const orderStatusColor: Record<
    number,
    {
        label: string
        dotClass: string
        textClass: string
    }
> = {
    0: {
        label: 'پرداخت شده',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-500',
    },
    1: {
        label: 'در انتظار',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-500',
    },
    2: { label: 'شکست خورده', dotClass: 'bg-red-500', textClass: 'text-red-500' },
}

const OrderColumn = ({ row }: { row: Order }) => {
    const navigate = useNavigate()

    const handleView = useCallback(() => {
        navigate(`/concepts/orders/order-details/${row.id}`)
    }, [navigate, row])

    return (
        <span
            className={`cursor-pointer select-none font-semibold hover:text-primary`}
            onClick={handleView}
        >
            #{row.id}
        </span>
    )
}

const columnHelper = createColumnHelper<Order>()

const columns = [
    columnHelper.accessor('id', {
        header: 'سفارش',
        cell: (props) => <OrderColumn row={props.row.original} />,
    }),
    columnHelper.accessor('status', {
        header: 'وضعیت',
        cell: (props) => {
            const { status } = props.row.original
            return (
                <div className="flex items-center">
                    <Badge className={orderStatusColor[status].dotClass} />
                    <span
                        className={`ml-2 rtl:mr-2 capitalize font-semibold ${orderStatusColor[status].textClass}`}
                    >
                        {orderStatusColor[status].label}
                    </span>
                </div>
            )
        },
    }),
    columnHelper.accessor('date', {
        header: 'تاریخ',
        cell: (props) => {
            const row = props.row.original
            return <span dir='ltr'>{jalaliMoment.unix(row.date).format('jYYYY/jMM/jDD')}</span>
        },
    }),
    columnHelper.accessor('customer', {
        header: 'مشتری',
    }),
    columnHelper.accessor('totalAmount', {
        header: 'مبلغ صرف شده',
        cell: (props) => {
            const { totalAmount } = props.row.original
            return (
                <NumericFormat
                    className="heading-text font-bold"
                    displayType="text"
                    value={(Math.round(totalAmount * 100) / 100).toFixed(2)}
                    prefix={'$'}
                    thousandSeparator={true}
                />
            )
        },
    }),
]

const RecentOrder = ({ data = [] }: RecentOrderProps) => {
    const navigate = useNavigate()

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <h4>سفارشات اخیر</h4>
                <Button
                    size="sm"
                    onClick={() => navigate('/concepts/orders/order-list')}
                >
                    مشاهده سفارشات
                </Button>
            </div>
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
        </Card>
    )
}

export default RecentOrder
