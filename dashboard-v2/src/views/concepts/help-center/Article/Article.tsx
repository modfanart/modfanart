import Loading from '@/components/shared/Loading'
import Container from '@/components/shared/Container'
import MediaSkeleton from '@/components/shared/loaders/MediaSkeleton'
import TextBlockSkeleton from '@/components/shared/loaders/TextBlockSkeleton'
import ArticleBody from './components/ArticleBody'
import ArticleAction from './components/ArticleAction'
import ArticleTableOfContent from './components/ArticleTableOfContent'
import { apiGetSupportHubArticle } from '@/services/HelpCenterService'
import { useParams } from 'react-router-dom'
import useSWR from 'swr'
import type { GetSupportHubArticleResponse } from './types'

const Article = () => {
    const { id } = useParams()

    const { data, isLoading } = useSWR(
        [`/api/helps/articles/${id}`, { id: id as string }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetSupportHubArticle<GetSupportHubArticleResponse>(params),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            evalidateOnFocus: false,
        },
    )

    return (
        <Container>
            <div className="lg:flex gap-4">
                <div className="my-6 max-w-[800px] w-full mx-auto">
                    <Loading
                        loading={isLoading}
                        customLoader={
                            <div className="flex flex-col gap-8">
                                <MediaSkeleton />
                                <TextBlockSkeleton rowCount={6} />
                                <TextBlockSkeleton rowCount={4} />
                                <TextBlockSkeleton rowCount={8} />
                            </div>
                        }
                    >
                        {data && <ArticleBody data={data} />}
                    </Loading>
                    <ArticleAction />
                </div>
                {data && (
                    <ArticleTableOfContent content={data.tableOfContent} />
                )}
            </div>
        </Container>
    )
}

export default Article
