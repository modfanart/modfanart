import Tag from '@/components/ui/Tag'
import { useIssueStore } from '../store/issueStore'

const IssueHeader = () => {
    const { issueData, updateIssueData } = useIssueStore()

    const handleTitleChange = (value: string) => {
        const newData = { ...issueData }
        newData.title = value
        updateIssueData(newData)
    }

    return (
        <div className="flex flex-col gap-2">
            <div>
                <Tag>{issueData.ticketId}</Tag>
            </div>
            <input
                className="h3 font-bold outline-none bg-transparent"
                defaultValue={issueData.title}
                onBlur={(e) => handleTitleChange(e.target.value)}
            />
        </div>
    )
}

export default IssueHeader
