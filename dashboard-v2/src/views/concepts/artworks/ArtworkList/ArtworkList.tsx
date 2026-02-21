// src/features/artworks/pages/ArtworkList.tsx
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ArtworkListActionTools from './components/ArtworkListActionTools'
import ArtworkListTableTools from './components/ArtworkListTableTools'
import ArtworkListTable from './components/ArtworkListTable'
import ArtworkListSelected from './components/ArtworkListSelected'

import { useState } from 'react'
import { useDebounce } from '@/utils/hooks/useDebounce'

import type { ArtworkListItem } from '@/services/artworkApi'

const ArtworkList = () => {
    // ────────────────────────────────────────────────
    // Shared state for search + filters + selection
    // ────────────────────────────────────────────────
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search.trim(), 500)

    const [filters, setFilters] = useState<{
        status?: string
        categories?: string[]
    }>({})

    const [selectedArtworks, setSelectedArtworks] = useState<ArtworkListItem[]>(
        [],
    )

    // Optional: reset selection when search or filters change (common UX)
    // useEffect(() => {
    //     setSelectedArtworks([])
    // }, [debouncedSearch, filters])

    const handleClearSelection = () => {
        setSelectedArtworks([])
    }

    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-5">
                        {/* Header + Create/Export buttons */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <h3 className="text-xl font-bold heading-text">
                                My Artworks
                            </h3>
                            <ArtworkListActionTools />
                        </div>

                        {/* Search + Filters */}
                        <ArtworkListTableTools
                        // If your ArtworkListTableTools accepts these props:
                        // searchValue={search}
                        // onSearchChange={setSearch}
                        // onApplyFilters={setFilters}
                        // Otherwise, update the child component to accept them
                        />

                        {/* Main Table */}
                        <ArtworkListTable
                            search={debouncedSearch}
                            filters={filters}
                            selectedArtworks={selectedArtworks}
                            onSelectionChange={setSelectedArtworks}
                        />
                    </div>
                </AdaptiveCard>
            </Container>

            {/* Sticky footer with bulk actions when items are selected */}
            <ArtworkListSelected
                selectedArtworks={selectedArtworks}
                onClearSelection={handleClearSelection}
            />
        </>
    )
}

export default ArtworkList
