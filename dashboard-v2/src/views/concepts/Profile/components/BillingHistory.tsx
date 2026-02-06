import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { NumericFormat } from 'react-number-format'
import dayjs from 'dayjs'
import moment from 'jalali-moment'
type Bill = {
    id: string
    item: string
    status: string
    amount: number
    date: number
}

type BillingHistoryProps = {
    data: Bill[]
    className?: string
}

const { Tr, Th, Td, THead, TBody } = Table

const statusColor: Record<string, string> = {
    'پرداخت شده': 'bg-emerald-500',
    'در انتظار': 'bg-amber-400',
}

const columnHelper = createColumnHelper<Bill>()

const columns = [
    columnHelper.accessor('id', {
        header: 'ارجاع',
        cell: (props) => {
            const row = props.row.original
            return (
                <span className="heading-text font-bold cursor-pointer">
                    {row.id}
                </span>
            )
        },
    }),
    columnHelper.accessor('item', {
        header: 'محصول',
        cell: (props) => {
            const row = props.row.original
            return <span className="font-semibold">{row.item}</span>
        },
    }),
    columnHelper.accessor('status', {
        header: 'وضعیت',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className="flex items-center gap-2">
                    <Badge className={statusColor[row.status]} />
                    <span className="heading-text font-bold capitalize">
                        {row.status}
                    </span>
                </div>
            )
        },
    }),
    columnHelper.accessor('date', {
        header: 'تاریخ',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className="flex items-center">
                    {moment.unix(row.date).locale('fa').format('YYYY/MM/DD')}
                </div>
            )
        },
    }),
    columnHelper.accessor('amount', {
        header: 'مقدار',
        cell: (props) => {
            const row = props.row.original
            return (
                <div className="flex items-center">
                    <NumericFormat
                        displayType="text"
                        value={(Math.round(row.amount * 100) / 100).toFixed(2)}
                        prefix={'$'}
                        thousandSeparator={true}
                    />
                </div>
            )
        },
    }),
]

const BillingHistory = ({ data = [], ...rest }: BillingHistoryProps) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div {...rest}>
            <Table>
                <THead className="!bg-transparent">
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
        </div>
    )
}

export default BillingHistory
