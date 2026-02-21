// src/pages/concepts/collections/CollectionList.tsx
// (or src/views/collections/CollectionList.tsx — adjust path to match your routing)

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import CollectionListTable from './components/CollectionListTable'
import CollectionListActionTools from './components/CollectionListActionTools'
import CollectionListTableTools from './components/CollectionListTableTools'
import CollectionListSelected from './components/CollectionListSelected'

const CollectionList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-5">
                        {/* Header + Action buttons (Create / Export) */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <h3 className="text-xl font-bold">مجموعه‌ها</h3>
                            <CollectionListActionTools />
                        </div>

                        {/* Search + Filter toolbar */}
                        <CollectionListTableTools />

                        {/* Main table with pagination, selection, sorting */}
                        <CollectionListTable />
                    </div>
                </AdaptiveCard>
            </Container>

            {/* Sticky footer that appears when items are selected */}
            <CollectionListSelected />
        </>
    )
}

export default CollectionList
