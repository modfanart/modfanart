import useCustomerList from '../hooks/useOrderlist'
import DebouceInput from '@/components/shared/DebouceInput'
import OrderListTableFilter from './OrderListTableFilter'
import { TbSearch } from 'react-icons/tb'
import cloneDeep from 'lodash/cloneDeep'
import type { ChangeEvent } from 'react'

const OrderListTableTools = () => {
    const { tableData, setTableData } = useCustomerList()

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        if (typeof val === 'string' && val.length > 1) {
            setTableData(newTableData)
        }

        if (typeof val === 'string' && val.length === 0) {
            setTableData(newTableData)
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <DebouceInput
                placeholder="جستجو"
                suffix={<TbSearch className="text-lg" />}
                onChange={handleInputChange}
            />
            <OrderListTableFilter />
        </div>
    )
}

export default OrderListTableTools
