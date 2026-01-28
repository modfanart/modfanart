import { lazy } from 'react'
import { GUIDE_PREFIX_PATH } from '@/constants/route.constant'
import type { Routes } from '@/@types/routes'

const guideRoute: Routes = [
    {
        key: 'guide.documentation',
        path: `${GUIDE_PREFIX_PATH}/documentation/*`,
        component: lazy(() => import('@/views/guide/Documentations')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'guide.sharedComponentDoc',
        path: `${GUIDE_PREFIX_PATH}/shared-component-doc/*`,
        component: lazy(() => import('@/views/guide/SharedComponentsDoc')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'guide.utilsDoc',
        path: `${GUIDE_PREFIX_PATH}/utils-doc/*`,
        component: lazy(() => import('@/views/guide/UtilsDoc')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'guide.changelog',
        path: `${GUIDE_PREFIX_PATH}/changelog`,
        component: lazy(() => import('@/views/guide/ChangeLog')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export default guideRoute
