import { useMemo } from 'react'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useOrderlist from '../hooks/useOrderlist'
import cloneDeep from 'lodash/cloneDeep'
import { useNavigate } from 'react-router-dom'
import { TbTrash, TbEye } from 'react-icons/tb'
import dayjs from 'dayjs'
import { NumericFormat } from 'react-number-format'
import type { OnSortParam, ColumnDef } from '@/components/shared/DataTable'
import type { Order } from '../types'
import type { TableQueries } from '@/@types/common'
import moment from 'jalali-moment'

const orderStatusColor: Record<
    number,
    {
        label: string
        bgClass: string
        textClass: string
    }
> = {
    0: {
        label: 'پرداخت شده',
        bgClass: 'bg-success-subtle',
        textClass: 'text-success',
    },
    1: {
        label: 'در انتظار',
        bgClass: 'bg-warning-subtle',
        textClass: 'text-warning',
    },
    2: { label: 'ناموفق', bgClass: 'bg-error-subtle', textClass: 'text-error' },
}

const OrderColumn = ({ row }: { row: Order }) => {
    const navigate = useNavigate()

    const onView = () => {
        navigate(`/concepts/orders/order-details/${row.id}`)
    }

    return (
        <span
            className="cursor-pointer font-bold heading-text hover:text-primary"
            onClick={onView}
        >
            #{row.id}
        </span>
    )
}

const ActionColumn = ({ row }: { row: Order }) => {
    const navigate = useNavigate()

    const onDelete = () => {}

    const onView = () => {
        navigate(`/concepts/orders/order-details/${row.id}`)
    }

    return (
        <div className="flex justify-end text-lg gap-1">
            <Tooltip wrapperClass="flex" title="مشاهده">
                <span className={`cursor-pointer p-2`} onClick={onView}>
                    <TbEye />
                </span>
            </Tooltip>
            <Tooltip wrapperClass="flex" title="حذف">
                <span
                    className="cursor-pointer p-2 hover:text-red-500"
                    onClick={onDelete}
                >
                    <TbTrash />
                </span>
            </Tooltip>
        </div>
    )
}

const PaymentMethodImage = ({
    paymentMehod,
    className,
}: {
    paymentMehod: string
    className: string
}) => {
    switch (paymentMehod) {
        case 'visa':
            return (
                <img
                    className={className}
                    src="/img/others/img-8.png"
                    alt={paymentMehod}
                />
            )
        case 'master':
            return (
                <img
                    className={className}
                    src="/img/others/img-9.png"
                    alt={paymentMehod}
                />
            )
        case 'paypal':
            return (
                <img
                    className={className}
                    src="/img/others/img-10.png"
                    alt={paymentMehod}
                />
            )
        default:
            return <></>
    }
}

const OrderListTable = () => {
    const { orderList, orderListTotal, tableData, isLoading, setTableData } =
        useOrderlist()

        const columns: ColumnDef<Order>[] = useMemo(
            () => [
                {
                    header: 'سفارش',
                    accessorKey: 'id',
                    cell: (props) => <OrderColumn row={props.row.original} />,
                },
                {
                    header: 'تاریخ',
                    accessorKey: 'date',
                    cell: (props) => {
                        const row = props.row.original
                        return (
                            <span className="font-semibold">
                                {moment.unix(row.date).locale('fa').format('YYYY/MM/DD')}
                            </span>
                        )
                    },
                },
                {
                    header: 'مشتری',
                    accessorKey: 'customer',
                    cell: (props) => {
                        const row = props.row.original
                        return <span className="font-semibold">{row.customer}</span>
                    },
                },
                {
                    header: 'وضعیت',
                    accessorKey: 'status',
                    cell: (props) => {
                        const { status } = props.row.original
                        return (
                            <Tag className={orderStatusColor[status].bgClass}>
                                <span
                                    className={`capitalize font-semibold ${orderStatusColor[status].textClass}`}
                                >
                                    {orderStatusColor[status].label}
                                </span>
                            </Tag>
                        )
                    },
                },
                {
                    header: 'روش پرداخت',
                    accessorKey: 'paymentMehod',
                    cell: (props) => {
                        const { paymentMehod, paymentIdendifier } =
                            props.row.original
                        return (
                            <span className="flex items-center gap-2">
                                <PaymentMethodImage
                                    className="max-h-[20px]"
                                    paymentMehod={paymentMehod}
                                />
                                <span className="font-semibold">
                                    {paymentIdendifier}
                                </span>
                            </span>
                        )
                    },
                },
                {
                    header: 'مجموع',
                    accessorKey: 'totalAmount',
                    cell: (props) => {
                        const { totalAmount } = props.row.original
                        return (
                            <NumericFormat
                                className="heading-text font-bold"
                                displayType="text"
                                value={(
                                    Math.round(totalAmount * 100) / 100
                                ).toFixed(2)}
                                prefix={'$'}
                                thousandSeparator={true}
                            />
                        )
                    },
                },
                {
                    header: '',
                    id: 'action',
                    cell: (props) => <ActionColumn row={props.row.original} />,
                },
            ],
            [],
        )
        

    const handleSetTableData = (data: TableQueries) => {
        setTableData(data)
    }

    const handlePaginationChange = (page: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageIndex = page
        handleSetTableData(newTableData)
    }

    const handleSelectChange = (value: number) => {
        const newTableData = cloneDeep(tableData)
        newTableData.pageSize = Number(value)
        newTableData.pageIndex = 1
        handleSetTableData(newTableData)
    }

    const handleSort = (sort: OnSortParam) => {
        const newTableData = cloneDeep(tableData)
        newTableData.sort = sort
        handleSetTableData(newTableData)
    }

    return (
        <DataTable
            columns={columns}
            data={orderList}
            noData={!isLoading && orderList.length === 0}
            skeletonAvatarColumns={[0]}
            skeletonAvatarProps={{ width: 28, height: 28 }}
            loading={isLoading}
            pagingData={{
                total: orderListTotal,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
            }}
            onPaginationChange={handlePaginationChange}
            onSelectChange={handleSelectChange}
            onSort={handleSort}
        />
    )
}

export default OrderListTable
