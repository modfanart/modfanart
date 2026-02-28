import { lazy } from 'react'
import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const conceptsRoute: Routes = [
    {
        key: 'concepts.artworks.artworkList',
        path: `${CONCEPTS_PREFIX_PATH}/artworks/list`,
        component: lazy(() => import('@/views/concepts/artworks/ArtworkList')),
        authority: [ADMIN, USER],
    },
]

export default conceptsRoute
