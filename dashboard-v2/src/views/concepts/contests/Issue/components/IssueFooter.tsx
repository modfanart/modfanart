import { useRef } from 'react'
import { useIssueStore } from '../store/issueStore'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tabs from '@/components/ui/Tabs'
import NoMedia from '@/assets/svg/NoMedia'
import dayjs from 'dayjs'
import cloneDeep from 'lodash/cloneDeep'
import uniqueId from 'lodash/uniqueId'
import ReactHtmlParser from 'html-react-parser'
import { TbDownload, TbTrash } from 'react-icons/tb'
import moment from 'jalali-moment'

const { TabNav, TabList, TabContent } = Tabs

const createCommentObject = (message: string) => {
    return {
        id: uniqueId('comment'),
        name: 'Angelina Gotelli',
        src: '/img/avatars/thumb-1.jpg',
        message: message,
        date: dayjs().format('DD MMM YYYY'),
    }
}

const IssueFooter = () => {
    const { issueData, updateIssueData } = useIssueStore()

    const commentInput = useRef<HTMLInputElement>(null)

    const submitComment = () => {
        if (commentInput.current) {
            const message = commentInput.current.value
            const comment = createCommentObject(message)
            const comments = cloneDeep(issueData.comments)
            comments?.push(comment)
            issueData.comments = comments
            updateIssueData(issueData)
            commentInput.current.value = ''
        }
    }

    return (
        <Tabs className="mt-6" defaultValue="comments">
            <TabList>
                <TabNav value="comments">نظرات</TabNav>
                <TabNav value="attachments">پیوست ها</TabNav>
            </TabList>
            <div className="p-4">
                <TabContent value="comments">
                    <div className="w-full">
                        {issueData.comments &&
                            issueData?.comments?.length > 0 && (
                                <>
                                    {issueData.comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="mb-3 flex"
                                        >
                                            <div className="mt-2">
                                                <Avatar
                                                    shape="circle"
                                                    src={comment.src}
                                                />
                                            </div>
                                            <div className="ml-2 rtl:mr-2 p-3 rounded w-100">
                                                <div className="flex items-center mb-2">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {comment.name}
                                                    </span>
                                                    <span className="mx-1">
                                                        {' '}
                                                        |{' '}
                                                    </span>
                                                    <span>
                                                        {moment(
                                                            comment.date,
                                                        ).locale('fa').format(
                                                            'DD MMMM YYYY',
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    {ReactHtmlParser(
                                                        comment.message || '',
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        <div className="mb-3 flex gap-2">
                            <Avatar
                                shape="circle"
                                src="/img/avatars/thumb-1.jpg"
                            />
                            <div className="w-full relative">
                                <Input
                                    ref={commentInput}
                                    textArea
                                    placeholder="نظر بنویس"
                                />
                                <div className="absolute bottom-4 right-4">
                                    <div
                                        className="cursor-pointer font-semibold text-primary "
                                        onClick={() => submitComment()}
                                    >
                                        ارسال کنید
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabContent>
                <TabContent value="attachments">
                    {issueData.attachments &&
                    issueData?.attachments?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            {issueData.attachments.map((file) => (
                                <Card
                                    key={file.id}
                                    bodyClass="px-3 pt-3 pb-1"
                                    className="bg-gray-100 dark:bg-gray-700 shadow-none"
                                    bordered={false}
                                >
                                    <img
                                        className="max-w-full rounded-lg"
                                        alt={file.name}
                                        src={file.src}
                                    />
                                    <div className="mt-1 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {file.name}
                                            </div>
                                            <span className="text-xs">
                                                {file.size}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Tooltip title="دانلود">
                                                <Button
                                                    variant="plain"
                                                    size="xs"
                                                    icon={<TbDownload />}
                                                />
                                            </Tooltip>
                                            <Tooltip title="حذف">
                                                <Button
                                                    variant="plain"
                                                    size="xs"
                                                    icon={<TbTrash />}
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <NoMedia height={150} width={150} />
                            <p className="font-semibold">No attachments</p>
                        </div>
                    )}
                </TabContent>
            </div>
        </Tabs>
    )
}

export default IssueFooter
