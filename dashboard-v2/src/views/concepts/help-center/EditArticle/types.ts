export type TableContent = {
    id: string
    label: string
}[]

export type ArticleTag = {
    id: string
    label: string
}

export type ArticleContent = {
    id: string
    title: string
    content: string
    category: string
    authors: {
        name: string
        img: string
    }[]
    tags: ArticleTag[]
    starred: boolean
    updateTime: string
    createdBy: string
    timeToRead: number
    viewCount: number
    commentCount: number
    tableOfContent: TableContent
}

export type GetSupportHubArticleResponse = ArticleContent
