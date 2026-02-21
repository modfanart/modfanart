// src/components/collections/CollectionListTableTools.tsx

import { useMemo } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import CollectionListSearch from './CollectionListSearch'
import CollectionListTableFilter from './CollectionListTableFilter'

type TableQueries = {
    pageIndex: number
    pageSize: number
    sort?: { order: string; key: string }
    query?: string // ← search term
    // add other filters if needed (is_public, etc.)
}

interface CollectionListTableToolsProps {
    tableData: TableQueries
    setTableData: (data: TableQueries) => void
    // Optional: if you want to pass setFilters or other setters
}

const CollectionListTableTools = ({
    tableData,
    setTableData,
}: CollectionListTableToolsProps) => {
    const handleSearchChange = (val: string) => {
        const trimmed = val.trim()
        const newTableData = cloneDeep(tableData)

        newTableData.query = trimmed
        newTableData.pageIndex = 1 // reset to first page on search change

        // You can adjust the threshold (0, 1, 2, 3 characters)
        // Most common patterns: trigger on ≥ 2 chars or on empty
        if (trimmed.length === 0 || trimmed.length >= 2) {
            setTableData(newTableData)
        }
        // If you want to debounce more aggressively, do it inside CollectionListSearch
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            {/* Search input */}
            <div className="w-full md:w-80 lg:w-96">
                <CollectionListSearch
                    onSearchChange={handleSearchChange}
                    // You can pass defaultValue={tableData.query} if you want controlled input
                />
            </div>

            {/* Filter button + dialog */}
            <div className="flex justify-end md:justify-start">
                <CollectionListTableFilter
                // If filter state is also managed here or in parent:
                // filterData={tableData.filters}
                // setFilterData={(filters) => {
                //   const newData = cloneDeep(tableData)
                //   newData.filters = filters
                //   newData.pageIndex = 1
                //   setTableData(newData)
                // }}
                />
            </div>
        </div>
    )
}

export default CollectionListTableTools
