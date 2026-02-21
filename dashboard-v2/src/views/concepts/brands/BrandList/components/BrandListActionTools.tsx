import { TbCloudDownload, TbPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import Button from '@/components/ui/Button'

// ─── Import RTK Query hook ──────────────────────────────────────
import { useGetMyBrandsQuery } from '@/services/brands'
const BrandListActionTools = () => {
    const navigate = useNavigate()

    // Get the current user's managed brands
    const { data: myBrands = [], isLoading } = useGetMyBrandsQuery()

    // Prepare data for CSV export
    const csvData = myBrands.map((brand) => ({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        website: brand.website || '',
        status: brand.status,
        followers_count: brand.followers_count,
        views_count: brand.views_count,
        created_at: brand.created_at,
        // Add more fields you want in CSV
    }))

    // Optional: define CSV headers for better column names
    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Name', key: 'name' },
        { label: 'Slug', key: 'slug' },
        { label: 'Description', key: 'description' },
        { label: 'Website', key: 'website' },
        { label: 'Status', key: 'status' },
        { label: 'Followers', key: 'followers_count' },
        { label: 'Views', key: 'views_count' },
        { label: 'Created At', key: 'created_at' },
    ]

    return (
        <div className="flex flex-col md:flex-row gap-3">
            {/* Export brands to CSV */}
            <CSVLink
                className="w-full md:w-auto"
                filename="my-brands-export.csv"
                data={csvData}
                headers={csvHeaders}
                disabled={isLoading || myBrands.length === 0}
            >
                <Button
                    icon={<TbCloudDownload className="text-xl" />}
                    className="w-full"
                    disabled={isLoading || myBrands.length === 0}
                    loading={isLoading}
                >
                    Export Brands
                </Button>
            </CSVLink>

            {/* Create new brand button */}
            <Button
                variant="solid"
                icon={<TbPlus className="text-xl" />}
                onClick={() => navigate('/concepts/brands/brand-create')} // ← update path to your actual route
            >
                Add New Brand
            </Button>
        </div>
    )
}

export default BrandListActionTools
