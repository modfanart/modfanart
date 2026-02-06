import { forwardRef } from 'react'
import Input from '@/components/ui/Input'
import { TbSearch } from 'react-icons/tb'
import useDebounce from '@/utils/hooks/useDebounce'
import type { ChangeEvent } from 'react'

type ProductListSearchProps = {
    onInputChange: (value: string) => void
}

const ProductListSearch = forwardRef<HTMLInputElement, ProductListSearchProps>(
    (props, ref) => {
        const { onInputChange } = props

        function handleDebounceFn(value: string) {
            onInputChange?.(value)
        }

        const debounceFn = useDebounce(handleDebounceFn, 500)

        const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
            debounceFn(e.target.value)
        }

        return (
            <Input
                ref={ref}
                placeholder="جستجو"
                suffix={<TbSearch className="text-lg" />}
                onChange={handleInputChange}
            />
        )
    },
)

ProductListSearch.displayName = 'ProductListSearch'

export default ProductListSearch
