import { useIssueStore } from '../store/issueStore'
import Timeline from '@/components/ui/Timeline'
import { ActivityAvatar, ActivityEvent } from '@/components/view/Activity'
import isEmpty from 'lodash/isEmpty'

const IssueActivity = () => {
    const { issueData } = useIssueStore()

    return (
        <div className="lg:px-6">
            <h5 className="mb-4">Activity</h5>
            <Timeline>
                {isEmpty(issueData.activity) ? (
                    <Timeline.Item>No Activities</Timeline.Item>
                ) : (
                    issueData.activity.map((event, index) => (
                        <Timeline.Item
                            key={event.type + index}
                            media={<ActivityAvatar data={event} />}
                        >
                            <div className="mt-1">
                                <ActivityEvent compact data={event} />
                            </div>
                        </Timeline.Item>
                    ))
                )}
            </Timeline>
        </div>
    )
}

export default IssueActivity
