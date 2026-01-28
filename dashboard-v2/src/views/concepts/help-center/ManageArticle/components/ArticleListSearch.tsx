import DebouceInput from '@/components/shared/DebouceInput'
import { useManageArticleStore } from '../store/manageArticleStore'
import { TbSearch } from 'react-icons/tb'

const ArticleListSearch = () => {
    const tableData = useManageArticleStore((state) => state.tableData)
    const setTableData = useManageArticleStore((state) => state.setTableData)

    const handleInputChange = (value: string) => {
        const newTableData = structuredClone(tableData)
        newTableData.query = value
        newTableData.pageIndex = 1
        if (typeof value === 'string' && value.length > 1) {
            setTableData(newTableData)
        }

        if (typeof value === 'string' && value.length === 0) {
            setTableData(newTableData)
        }
    }

    return (
        <DebouceInput
            placeholder="جستجو..."
            type="text"
            prefix={<TbSearch className="text-lg" />}
            onChange={(e) => handleInputChange(e.target.value)}
        />
    )
}

export default ArticleListSearch
