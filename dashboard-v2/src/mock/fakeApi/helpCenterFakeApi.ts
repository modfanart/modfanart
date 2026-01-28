/* eslint-disable @typescript-eslint/no-explicit-any */
import { mock } from '../MockAdapter'
import {
    categoriesData,
    articleListData,
    articleDetailData,
} from '../data/helpCenterData'
import wildCardSearch from '@/utils/wildCardSearch'
import sortBy, { Primer } from '@/utils/sortBy'
import paginate from '@/utils/paginate'

mock.onGet(`/api/helps/categories`).reply(() => {
    return [
        200,
        {
            categories: categoriesData,
            popularArticles: articleListData.filter(
                (article) => article.starred,
            ),
        },
    ]
})

mock.onGet(`/api/helps/articles`).reply((config) => {
    const { topic, query } = config.params

    const articles: any[] = articleListData

    if (query) {
        return [200, wildCardSearch(articles, query)]
    }

    if (topic) {
        return [200, articles.filter((article) => article.category === topic)]
    }

    return [200, articles]
})

mock.onGet(new RegExp(`/api/helps/articles*`)).reply(function (config) {
    const id = config.url?.split('/')[3]
    const article = articleListData.find((article) => article.id === id)

    if (!article) {
        return [404, {}]
    }

    return [200, { ...article, ...articleDetailData }]
})

mock.onGet(`/api/helps/manage/articles`).reply((config) => {
    const { pageIndex, pageSize, sort, query, category } = config.params

    console.log('config.params', config.params)

    const { order, key } = sort

    const articles = articleListData as any[]

    let data = articles
    let total = articles.length

    if (key && order) {
        if (key !== 'updateTimeStamp') {
            data.sort(
                sortBy(key, order === 'desc', (a) =>
                    (a as string).toUpperCase(),
                ),
            )
        } else {
            data.sort(sortBy(key, order === 'desc', parseInt as Primer))
        }
    }

    if (query) {
        data = wildCardSearch(data, query)
        total = data.length
    }

    if (category) {
        data = data.filter((item) => category.includes(item.category))
    }

    data = paginate(data, pageSize, pageIndex)

    const responseData = {
        list: data,
        total: total,
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([200, responseData])
        }, 500)
    })
})
