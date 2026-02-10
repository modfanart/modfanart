import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Progress from '@/components/ui/Progress'
import Tag from '@/components/ui/Tag'
import ReactHtmlParser from 'html-react-parser'
import dayjs from 'dayjs'
import jalaliMoment from 'jalali-moment';

type ProjectDetailsOverviewProps = {
    content: string
    isContentEdit: boolean
    onContentChange: (content: string) => void
    setIsContentEdit: (isEdit: boolean) => void
    client: Partial<{
        clientName: string
        skateHolder: {
            name: string
            img: string
        }
        projectManager: {
            name: string
            img: string
        }
    }>
    schedule: Partial<{
        startDate: number
        dueDate: number
        status: string
        completion: number
    }>
}

const ProjectDetailsOverview = (props: ProjectDetailsOverviewProps) => {
    const { content = '', client = {}, schedule = {} } = props

    return (
        <div className="flex flex-col lg:flex-row flex-auto gap-12">
            <div className="prose max-w-full">{ReactHtmlParser(content)}</div>
            <div className="lg:min-w-[320px] lg:w-[350px]">
                <Card
                    bordered={false}
                    className="bg-gray-100 dark:bg-gray-800 shadow-none"
                >
                    <h5>اطلاعات مشتری</h5>
                    <div className="flex flex-col gap-5 mt-6">
                        <div>
                            <span className="font-semibold heading-text">
                                مشتری:
                            </span>
                            <span className="font-semibold">
                                {' '}
                                {client.clientName}
                            </span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="font-semibold heading-text">
                                دارنده اسکیت:
                            </div>
                            <div className="flex items-center gap-2">
                                <Avatar
                                    size={25}
                                    src={client.skateHolder?.img}
                                    alt=""
                                />
                                <span className="font-semibold">
                                    {client.skateHolder?.name}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="font-semibold heading-text">
                                مدیر پروژه:
                            </div>
                            <div className="flex items-center gap-2">
                                <Avatar
                                    size={25}
                                    src={client.projectManager?.img}
                                    alt=""
                                />
                                <span className="font-semibold">
                                    {client.projectManager?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card
                    bordered={false}
                    className="bg-gray-100 dark:bg-gray-800 shadow-none mt-6"
                >
                    <h5>برنامه زمانی</h5>
                    <div className="flex flex-col gap-5 mt-6">
                        <div>
                            <span className="font-semibold heading-text">
                                تاریخ شروع:
                            </span>
                            <span className="font-semibold">
                                {' '}
                                {jalaliMoment
                                    .unix(schedule.startDate as number)
                                    .locale('fa')
                                    .format('dddd, DD MMMM YYYY')}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold heading-text">
                                تاریخ موعد:
                            </span>
                            <span className="font-semibold">
                                {' '}
                                {jalaliMoment
                                    .unix(schedule.dueDate as number)
                                    .locale('fa')
                                    .format('dddd, DD MMMM YYYY')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold heading-text">
                                وضعیت:
                            </span>
                            <Tag className="border-2 bg-transparent text-green-600 border-green-600 dark:bg-transparent dark:text-green-600 dark:border-green-600 rounded-full">
                                {schedule.status}
                            </Tag>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="font-semibold heading-text">
                                درصد تکمیل:
                            </span>
                            <Progress
                                percent={schedule.completion}
                                trailClass="bg-gray-200 dark:bg-gray-600"
                                size="sm"
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>

    )
}

export default ProjectDetailsOverview
