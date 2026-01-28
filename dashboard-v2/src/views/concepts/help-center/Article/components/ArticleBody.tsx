import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import ReactHtmlParser from 'html-react-parser'
import type { ArticleContent } from '../types'

type ArticleProps = {
    data: ArticleContent
}

const ArticleBody = ({ data }: ArticleProps) => {
    return (
        <>
            <h3>{data.title}</h3>
            <div className="flex items-center mt-6 gap-4">
                <UsersAvatarGroup
                    avatarProps={{ size: 40 }}
                    users={data.authors || []}
                />
                <div className="text-xs">
                    <div className="mb-1">
                        ایجاد شده توسط:
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {data.createdBy}
                        </span>
                    </div>
                    <div>
                        <span>آخرین به روز رسانی: {data.updateTime}</span>
                        <span className="mx-2">•</span>
                        <span>{data.timeToRead} دقیقه خواندن</span>
                        <span className="mx-2">•</span>
                        <span>{data.viewCount} مشاهده شده است</span>
                    </div>
                </div>
            </div>
            <div className="mt-8 prose dark:prose-invert max-w-none prose-p:mt-2 prose-headings:font-bold">
                {ReactHtmlParser(data.content || '')}
            </div>
        </>
    )
}

export default ArticleBody
