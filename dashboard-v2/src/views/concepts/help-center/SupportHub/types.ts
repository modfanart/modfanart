export type Topic = {
    id: string
    name: string
    description: string
    articleCounts: number
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
    starred: boolean
    updateTime: string
    createdBy: string
    timeToRead: number
    viewCount: number
    commentCount: number
}

export type Topics = Topic[]

export type Articles = {
    id: string
    title: string
    content: string
    category: string
    authors: {
        name: string
        img: string
    }[]
    starred: boolean
    updateTime: string
    createdBy: string
    timeToRead: number
    viewCount: number
    commentCount: number
}[]

export type GetSupportHubCategoriesResponse = {
    categories: {
        name: string
        topics: Topics
    }[]
    popularArticles: Articles
}

export type GetSupportHubArticlesResponse = Articles
