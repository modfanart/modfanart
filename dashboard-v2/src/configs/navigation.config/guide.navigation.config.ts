import { GUIDE_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const guideNavigationConfig: NavigationTree[] = [
    {
        key: 'راهنما',
        path: '',
        title: 'راهنما',
        translateKey: 'nav.guide.guide',
        icon: 'راهنما',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [ADMIN, USER],
        subMenu: [
            {
                key: 'راهنما.مستندات',
                path: `${GUIDE_PREFIX_PATH}/documentation/introduction`,
                title: 'مستندات',
                translateKey: 'nav.guide.documentation',
                icon: 'مستندات',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.documentationDesc',
                        label: 'راهنمای قالب عمومی',
                    },
                },
                subMenu: [],
            },
            {
                key: 'راهنما.مستندات_کامپوننت_مشترک',
                path: `${GUIDE_PREFIX_PATH}/shared-component-doc/abbreviate-number`,
                title: 'کامپوننت مشترک',
                translateKey: 'nav.guide.sharedComponentDoc',
                icon: 'کامپوننت_مشترک',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.sharedComponentDocDesc',
                        label: 'استفاده از کامپوننت مشترک',
                    },
                },
                subMenu: [],
            },
            {
                key: 'راهنما.مستندات_ابزارها',
                path: `${GUIDE_PREFIX_PATH}/utils-doc/use-auth`,
                title: 'ابزارها',
                translateKey: 'nav.guide.utilsDoc',
                icon: 'ابزارها',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.utilsDocDesc',
                        label: 'مستندات درباره توابع ابزارها',
                    },
                },
                subMenu: [],
            },
            {
                key: 'راهنما.تغییرات_نسخه',
                path: `${GUIDE_PREFIX_PATH}/changelog`,
                title: 'تغییرات نسخه',
                translateKey: 'nav.guide.changeLog',
                icon: 'تغییرات_نسخه',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.guide.changeLogDesc',
                        label: 'تمام سوابق نسخه‌ها',
                    },
                },
                subMenu: [],
            },
        ],
    },
]


export default guideNavigationConfig
