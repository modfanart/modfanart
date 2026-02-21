// src/components/collections/CollectionListActionTools.tsx
// (or wherever you place your action bar / toolbar component)

import Button from '@/components/ui/Button'
import { TbCloudDownload, TbPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
import { CSVLink } from 'react-csv'

import {
    useGetCollectionsQuery,
    // If you later want to show count / loading state:
    // useGetCollectionsQuery,
} from '@/services/api/collectionsApi'

const CollectionListActionTools = () => {
    const navigate = useNavigate()

    // Fetch the list using RTK Query
    // You can add { skip: true } or polling / refetchOnMountOrArgChange if needed
    const { data, isLoading } = useGetCollectionsQuery(
        // Adjust filters according to your current context
        // Most common cases:
        // 1. Current user's collections
        { owner_type: 'user', owner_id: 'current' }, // ← backend should resolve "current"
        // 2. Or fixed brand:
        // { owner_type: 'brand', owner_id: 'brand-uuid-here' }
    )

    // Flatten / prepare data for CSV
    // You may want to transform fields, pick only useful columns, translate labels, etc.
    const csvData = data?.collections ?? []

    // Optional: better column headers + selected fields
    const csvHeaders = [
        { label: 'ID', key: 'id' },
        { label: 'Name', key: 'name' },
        { label: 'Slug', key: 'slug' },
        { label: 'Description', key: 'description' },
        { label: 'Public', key: 'is_public' },
        { label: 'Cover Image', key: 'cover_image_url' },
        { label: 'Created At', key: 'created_at' },
    ]

    return (
        <div className="flex flex-col md:flex-row gap-3">
            {/* Export button */}
            <CSVLink
                className="w-full"
                filename="collections.csv"
                data={csvData}
                headers={csvHeaders} // optional but recommended
                enclosingCharacter="" // cleaner output (optional)
                asyncOnClick={(event, done) => {
                    if (isLoading || !data?.collections?.length) {
                        event.preventDefault()
                        // You can show toast/notification here
                        console.warn('No collections to export yet')
                        done(false)
                        return
                    }
                    done(true)
                }}
            >
                <Button
                    icon={<TbCloudDownload className="text-xl" />}
                    className="w-full"
                    disabled={isLoading || !csvData.length}
                >
                    دانلود کنید
                </Button>
            </CSVLink>

            {/* Create new collection button */}
            <Button
                variant="solid"
                icon={<TbPlus className="text-xl" />}
                onClick={() =>
                    navigate('/concepts/collections/collection-create')
                }
                // or wherever your create page lives, e.g.:
                // '/collections/new'
            >
                جدید اضافه کنید
            </Button>
        </div>
    )
}

export default CollectionListActionTools
