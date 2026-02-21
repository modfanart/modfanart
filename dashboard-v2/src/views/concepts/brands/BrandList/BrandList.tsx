import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import BrandListTable from './components/BrandListTable'
import BrandListActionTools from './components/BrandListActionTools'
import BrandListTableTools from './components/BrandListTableTools'
import BrandListSelected from './components/BrandListSelected'

const BrandList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-5">
                        {/* Header + Action Buttons */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                            <h3 className="text-xl font-bold">My Brands</h3>
                            <BrandListActionTools />
                        </div>

                        {/* Search + Filters */}
                        <BrandListTableTools />

                        {/* Main Table */}
                        <BrandListTable />
                    </div>
                </AdaptiveCard>
            </Container>

            {/* Sticky footer that appears when brands are selected */}
            <BrandListSelected />
        </>
    )
}

export default BrandList
