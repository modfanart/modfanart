```jsx
import { useState, useEffect, useMemo } from 'react'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import { apiGetCustomersList } from '@/services/CustomersService'
import type {
    ColumnDef,
    OnSortParam,
    CellContext,
    Row,
} from '@/components/shared/DataTable'

type Customer = {
    id: string
    name: string
    email: string
}

const Checkable = () => {
    const [data, setData] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [tableData, setTableData] = useState<{
        pageIndex: number
        pageSize: number
        sort: {
            order: '' | 'asc' | 'desc'
            key: string | number
        }
        query: string
        total: number
    }>({
        total: 0,
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sort: {
            order: '',
            key: '',
        },
    })

    const handleAction = (cellProps: CellContext<Customer, unknown>) => {
        console.log('Action clicked', cellProps)
    }

    const handleBatchAction = () => {
        console.log('selectedRows', selectedRows)
    }

    const columns: ColumnDef<Customer>[] = useMemo(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
            },
            {
                header: 'Email',
                accessorKey: 'email',
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <Button size="xs" onClick={() => handleAction(props)}>
                        Action
                    </Button>
                ),
            },
        ],
        []
    )

    const handlePaginationChange = (pageIndex: number) => {
        setTableData((prevData) => ({ ...prevData, ...{ pageIndex } }))
    }

    const handleSelectChange = (pageSize: number) => {
        setTableData((prevData) => ({ ...prevData, ...{ pageSize } }))
    }

    const handleSort = ({ order, key }: OnSortParam) => {
        setTableData((prevData) => ({
            ...prevData,
            ...{ sort: { order, key } },
        }))
    }

    const handleRowSelect = (checked: boolean, row: Customer) => {
        console.log('row', row)
        if (checked) {
            setSelectedRows((prevData) => {
                if (!prevData.includes(row.name)) {
                    return [...prevData, ...[row.name]]
                }
                return prevData
            })
        } else {
            setSelectedRows((prevData) => {
                if (prevData.includes(row.name)) {
                    return prevData.filter((id) => id !== row.name)
                }
                return prevData
            })
        }
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<Customer>[]) => {
        console.log('rows', rows)
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            const selectedIds: string[] = []
            originalRows.forEach((row) => {
                selectedIds.push(row.name)
            })
            setSelectedRows(selectedIds)
        } else {
            setSelectedRows([])
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const response = await apiGetCustomersList<{list: Customer[], total: number}, {}>(tableData)
            if (response.list) {
                setData(response.list)
                setLoading(false)
                setTableData((prevData) => ({
                    ...prevData,
                    ...{ total: response.total },
                }))
            }
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableData.pageIndex, tableData.sort, tableData.pageSize])

    return (
        <>
            {selectedRows.length > 0 && (
                <div className="flex justify-end mb-4">
                    <Button
                        size="sm"
                        variant="solid"
                        onClick={handleBatchAction}
                    >
                        Batch Action
                    </Button>
                </div>
            )}
            <DataTable<Customer>
                selectable
                columns={columns}
                data={data}
                loading={loading}
                pagingData={tableData}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
            />
        </>
    )
}

export default Checkable
```
