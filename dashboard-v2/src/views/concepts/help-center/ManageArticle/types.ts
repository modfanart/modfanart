export type ArticleTag = {
    id: string
    label: string
}

export type Article = {
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
    published: boolean
    updateTime: string
    updateTimeStamp: number
    createdBy: string
    timeToRead: number
    viewCount: number
    commentCount: number
}

export type Articles = Article[]

export type Filter = {
    category: string[]
}

export type GetArticleListResponse = {
    list: Articles
    total: number
}
