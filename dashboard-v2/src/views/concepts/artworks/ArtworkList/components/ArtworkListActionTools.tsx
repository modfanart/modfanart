import { TbCloudDownload, TbPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import Button from '@/components/ui/Button'
import { useGetMyArtworksQuery } from '@/services/artworkApi'

const ArtworkListActionTools = () => {
    const navigate = useNavigate()

    // Adjust params as needed (status, page, limit, etc)
    const { data, isLoading } = useGetMyArtworksQuery(
        { limit: 500 }, // ← increase if you have many artworks
        { skip: false },
    )

    const artworks = data?.artworks ?? []

    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Title', key: 'title' },
        { label: 'Description', key: 'description' },
        { label: 'Status', key: 'status' },
        { label: 'Views', key: 'views_count' },
        { label: 'Favorites', key: 'favorites_count' },
        { label: 'Created At', key: 'created_at' },
        { label: 'Thumbnail', key: 'thumbnail_url' },
        { label: 'File URL', key: 'file_url' },
    ]

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <CSVLink
                data={artworks}
                headers={csvHeaders}
                filename="artworks-export.csv"
                className={isLoading ? 'pointer-events-none opacity-60' : ''}
            >
                <Button
                    icon={<TbCloudDownload className="text-xl" />}
                    disabled={isLoading || artworks.length === 0}
                >
                    Export
                </Button>
            </CSVLink>

            <Button
                variant="solid"
                icon={<TbPlus className="text-xl" />}
                onClick={() => navigate('/artworks/new')} // ← fix this path if needed
            >
                Add New Artwork
            </Button>
        </div>
    )
}

export default ArtworkListActionTools
