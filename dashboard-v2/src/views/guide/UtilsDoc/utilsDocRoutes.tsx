import { lazy } from 'react'
import { DocumentationRoute } from '@/@types/docs'

const utilsDocRoutes: DocumentationRoute[] = [
    {
        groupName: 'Hooks',
        nav: [
            {
                path: 'use-auth',
                label: 'useAuth',
                component: lazy(() => import('./components/UseAuthDoc')),
            },
            {
                path: 'use-authority',
                label: 'useAuthority',
                component: lazy(() => import('./components/UseAuthorityDoc')),
            },
            {
                path: 'use-dark-mode',
                label: 'useDarkMode',
                component: lazy(() => import('./components/UseDarkModeDoc')),
            },
            {
                path: 'use-debounce',
                label: 'useDebounce',
                component: lazy(() => import('./components/UseDebounceDoc')),
            },
            {
                path: 'use-direction',
                label: 'useDirection',
                component: lazy(() => import('./components/UseDirectionDoc')),
            },
            {
                path: 'use-infinite-scroll',
                label: 'useInfiniteScroll',
                component: lazy(
                    () => import('./components/UseInfiniteScrollDoc'),
                ),
            },
            {
                path: 'use-interval',
                label: 'useInterval',
                component: lazy(() => import('./components/UseIntervalDoc')),
            },
            {
                path: 'use-layout',
                label: 'useLayout',
                component: lazy(() => import('./components/UseLayoutDoc')),
            },
            {
                path: 'use-menu-active',
                label: 'useMenuActive',
                component: lazy(() => import('./components/UseMenuActiveDoc')),
            },
            {
                path: 'use-query',
                label: 'useQuery',
                component: lazy(() => import('./components/UseQueryDoc')),
            },
            {
                path: 'use-random-bg-color',
                label: 'useRandomBgColor',
                component: lazy(
                    () => import('./components/UseRandomBgColorDoc'),
                ),
            },
            {
                path: 'use-responsive',
                label: 'useResponsive',
                component: lazy(() => import('./components/UseResponsiveDoc')),
            },
            {
                path: 'use-scroll-top',
                label: 'useScrollTop',
                component: lazy(() => import('./components/UseScrollTopDoc')),
            },
            {
                path: 'use-time-out-message',
                label: 'useTimeOutMessage',
                component: lazy(
                    () => import('./components/UseTimeOutMessageDoc'),
                ),
            },
            {
                path: 'use-translation',
                label: 'useTranslation',
                component: lazy(() => import('./components/UseTranslationDoc')),
            },
        ],
    },
    {
        groupName: 'Functions',
        nav: [
            {
                path: 'acronym',
                label: 'acronym',
                component: lazy(() => import('./components/AcronymDoc')),
            },
            {
                path: 'classNames',
                label: 'classNames',
                component: lazy(() => import('./components/ClassNamesDoc')),
            },
            {
                path: 'cookies-storage',
                label: 'cookiesStorage',
                component: lazy(() => import('./components/CookiesStorageDoc')),
            },
            {
                path: 'file-size-unit',
                label: 'fileSizeUnit',
                component: lazy(() => import('./components/FileSizeUnitDoc')),
            },
            {
                path: 'is-last-child',
                label: 'isLastChild',
                component: lazy(() => import('./components/IsLastChildDoc')),
            },
            {
                path: 'paginate',
                label: 'paginate',
                component: lazy(() => import('./components/PaginateDoc')),
            },
            {
                path: 'reoder-array',
                label: 'reoderArray',
                component: lazy(() => import('./components/ReoderArrayDoc')),
            },
            {
                path: 'reorder dragable',
                label: 'reorderDragable',
                component: lazy(
                    () => import('./components/ReorderDragableDoc'),
                ),
            },
            {
                path: 'sleep',
                label: 'sleep',
                component: lazy(() => import('./components/SleepDoc')),
            },
            {
                path: 'sort-by',
                label: 'sortBy',
                component: lazy(() => import('./components/SortByDoc')),
            },
            {
                path: 'wild-card-search',
                label: 'wildCardSearch',
                component: lazy(() => import('./components/WildCardSearchDoc')),
            },
        ],
    },
    {
        groupName: 'HOC',
        nav: [
            {
                path: 'with-header-item',
                label: 'withHeaderItem',
                component: lazy(() => import('./components/WithHeaderItemDoc')),
            },
        ],
    },
]

export default utilsDocRoutes
