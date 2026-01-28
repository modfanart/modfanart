import Avatar from '@/components/ui/Avatar'
import IconText from '@/components/shared/IconText'
import { categoryIcon } from '../utils'
import classNames from '@/utils/classNames'
import { useNavigate } from 'react-router-dom'
import { TbEye, TbMessage } from 'react-icons/tb'

type ArticleProps = {
    id: string
    isLastChild: boolean
    category: string
    categoryNameFuck?: string
    title: string
    timeToRead: number
    viewCount: number
    commentCount: number
}

const Article = ({
    id,
    isLastChild,
    category,
    title,
    timeToRead,
    viewCount,
    commentCount,
    categoryNameFuck
}: ArticleProps) => {
    const navigate = useNavigate()

    const handleArticleClick = () => {
        navigate(`/concepts/help-center/article/${id}`)
    }

    return (
        <div
            className={classNames(
                'flex items-center justify-between py-6 border-gray-200 dark:border-gray-700 group cursor-pointer',
                isLastChild && 'border-b',
            )}
            role="buttton"
            onClick={handleArticleClick}
        >
            <div className="flex items-center gap-4">
                <Avatar
                    className="bg-gray-100 dark:bg-gray-700"
                    size={50}
                    icon={
                        <span className="heading-text">
                            {categoryIcon[category]}
                        </span>
                    }
                    shape="round"
                />
                <div>
                    <h6 className="font-bold group-hover:text-primary">
                        {title}
                    </h6>
                    <div className="flex items-center gap-2">
                        <span>{timeToRead} دقیقه خواندن</span>
                        <span>•</span>
                        <span>{categoryNameFuck}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <IconText
                    className="font-semibold"
                    icon={<TbEye className="text-xl" />}
                >
                    {viewCount}
                </IconText>
                <IconText
                    className="font-semibold"
                    icon={<TbMessage className="text-xl" />}
                >
                    {commentCount}
                </IconText>
            </div>
        </div>
    )
}

export default Article
