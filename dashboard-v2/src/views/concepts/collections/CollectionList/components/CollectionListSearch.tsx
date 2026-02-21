// src/components/collections/CollectionListSearch.tsx
// (or place it next to your CollectionList / CollectionTable component)

import { forwardRef } from 'react'
import DebouceInput from '@/components/shared/DebouceInput' // assuming this is your debounced input
import { TbSearch } from 'react-icons/tb'

type CollectionListSearchProps = {
    onSearchChange: (searchTerm: string) => void
}

const CollectionListSearch = forwardRef<
    HTMLInputElement,
    CollectionListSearchProps
>((props, ref) => {
    const { onSearchChange } = props

    return (
        <DebouceInput
            ref={ref}
            placeholder="جستجوی مجموعه‌ها..."
            suffix={<TbSearch className="text-lg" />}
            onChange={(e) => onSearchChange(e.target.value.trim())}
        />
    )
})

CollectionListSearch.displayName = 'CollectionListSearch'

export default CollectionListSearch
