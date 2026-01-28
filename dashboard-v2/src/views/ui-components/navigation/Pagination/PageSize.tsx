import { useState } from 'react'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'

type Option = {
    value: number
    label: string
}

const options: Option[] = [
    { value: 5, label: '5 / صفحه' },
    { value: 10, label: '10 / صفحه' },
    { value: 20, label: '20 / صفحه' },
    { value: 50, label: '50 / صفحه' },
]

const PageSize = () => {
    const [pageSize, setPageSize] = useState(options[0].value)

    const onPageSelect = ({ value }: Option) => {
        setPageSize(value)
    }

    return (
        <div className="flex items-center">
            <Pagination displayTotal pageSize={pageSize} total={100} />
            <div style={{ minWidth: 120 }}>
                <Select
                    size="sm"
                    isSearchable={false}
                    defaultValue={options[0]}
                    options={options}
                    onChange={(selected) => onPageSelect(selected as Option)}
                />
            </div>
        </div>
    )
}

export default PageSize
