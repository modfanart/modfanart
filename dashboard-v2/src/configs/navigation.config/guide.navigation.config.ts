import { GUIDE_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const guideNavigationConfig: NavigationTree[] = [
    {
        key: 'guide',
        path: '',
        title: 'Guide',
        translateKey: 'nav.guide.guide',
        icon: 'guide', // ← changed icon key to match English convention
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'guide.documentation',
                path: `${GUIDE_PREFIX_PATH}/documentation/introduction`,
                title: 'Documentation',
                translateKey: 'nav.guide.documentation',
                icon: 'documentation',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.documentationDesc',
                        label: 'General template guide',
                    },
                },
                subMenu: [],
            },
            {
                key: 'guide.shared-components',
                path: `${GUIDE_PREFIX_PATH}/shared-component-doc/abbreviate-number`,
                title: 'Shared Components',
                translateKey: 'nav.guide.sharedComponentDoc',
                icon: 'shared-components',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.sharedComponentDocDesc',
                        label: 'Using shared UI components',
                    },
                },
                subMenu: [],
            },
            {
                key: 'guide.utils',
                path: `${GUIDE_PREFIX_PATH}/utils-doc/use-auth`,
                title: 'Utilities',
                translateKey: 'nav.guide.utilsDoc',
                icon: 'utils',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.utilsDocDesc',
                        label: 'Utility functions documentation',
                    },
                },
                subMenu: [],
            },
            {
                key: 'guide.changelog',
                path: `${GUIDE_PREFIX_PATH}/changelog`,
                title: 'Changelog',
                translateKey: 'nav.guide.changeLog',
                icon: 'changelog',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.changeLogDesc',
                        label: 'Version history & updates',
                    },
                },
                subMenu: [],
            },
        ],
    },
]

export default guideNavigationConfig
