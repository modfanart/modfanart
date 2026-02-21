// BrandListPage.tsx
import { useState, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import BrandListTableTools from '../components/BrandListTableTools'
import BrandListTableFilter from '../components/BrandListTableFilter'
import BrandListTable from '../components/BrandListTable'
import BrandListSelected from '../components/BrandListSelected'
import BrandListActionTools from '../components/BrandListActionTools'

import type { TableQueries } from '@/@types/common'
import type { Brand } from '@/services/brands'

// Optional: define the exact shape your API expects
type BrandQueryParams = {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    search?: string
    status?: string // comma-separated
    minFollowers?: number
    maxFollowers?: number
    hasLogo?: boolean
    hasBanner?: boolean
    verificationStatus?: string
}

const BrandListPage = () => {
    const [tableQueries, setTableQueries] = useState<
        TableQueries & Partial<BrandQueryParams>
    >({
        pageIndex: 1,
        pageSize: 10,
        sort: { id: 'created_at', desc: true },
        search: '',
        // Optional filters start empty/undefined
    })

    // Optional: derive RTK Query args from tableQueries
    const queryParams = useMemo<BrandQueryParams>(
        () => ({
            page: tableQueries.pageIndex,
            limit: tableQueries.pageSize,
            sortBy: tableQueries.sort?.id,
            sortOrder: tableQueries.sort?.desc ? 'desc' : 'asc',
            search: tableQueries.search || undefined,
            status: tableQueries.status?.join(',') || undefined,
            minFollowers: tableQueries.minFollowers,
            maxFollowers: tableQueries.maxFollowers,
            hasLogo: tableQueries.hasLogo,
            hasBanner: tableQueries.hasBanner,
            verificationStatus: tableQueries.verificationStatus,
        }),
        [tableQueries],
    )

    // Optional: reset page to 1 when filters or search change
    const handleQueriesChange = (newQueries: Partial<typeof tableQueries>) => {
        setTableQueries((prev) => ({
            ...prev,
            ...newQueries,
            pageIndex: 1, // almost always desired UX
        }))
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-5">
                    {/* Header + Create / Export buttons */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-2xl font-bold heading-text">
                            My Brands
                        </h2>
                        <BrandListActionTools />
                    </div>

                    {/* Search + Filter controls */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <BrandListTableTools
                            onSearchChange={(val) =>
                                handleQueriesChange({
                                    search: val,
                                    pageIndex: 1,
                                })
                            }
                        />

                        <BrandListTableFilter
                            currentFilters={tableQueries}
                            onFilterChange={(filters) =>
                                handleQueriesChange({
                                    ...filters,
                                    pageIndex: 1,
                                })
                            }
                        />
                    </div>

                    {/* Main Table */}
                    <BrandListTable
                        queries={queryParams} // ← pass derived params
                        onQueriesChange={handleQueriesChange}
                        // If you want to pass selection up:
                        // selectedBrands={...}
                        // onSelectionChange={...}
                    />
                </div>
            </AdaptiveCard>

            {/* Bulk actions footer when rows are selected */}
            <BrandListSelected />
        </Container>
    )
}

export default BrandListPage
