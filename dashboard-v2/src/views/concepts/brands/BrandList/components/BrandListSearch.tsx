import { forwardRef } from 'react'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'

type BrandListSearchProps = {
    onInputChange: (value: string) => void
}

const BrandListSearch = forwardRef<HTMLInputElement, BrandListSearchProps>(
    (props, ref) => {
        const { onInputChange } = props

        return (
            <DebouceInput
                ref={ref}
                placeholder="جستجوی سریع..."
                suffix={<TbSearch className="text-lg" />}
                onChange={(e) => onInputChange(e.target.value)}
            />
        )
    },
)

BrandListSearch.displayName = 'BrandListSearch'

export default BrandListSearch
