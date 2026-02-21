import { lazy } from 'react'
import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const conceptsRoute: Routes = [
    {
        key: 'concepts.customers.customerList',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-list`,
        component: lazy(
            () => import('@/views/concepts/collections/CollectionList'),
        ),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.customers.customerEdit',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-edit/:id`,
        component: lazy(
            () => import('@/views/concepts/collections/CustomerEdit'),
        ),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'ویرایش مشتری',
                description:
                    'Manage customer details, purchase history, and preferences.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.customers.customerCreate',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-create`,
        component: lazy(
            () => import('@/views/concepts/collections/CollectionCreate'),
        ),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'ایجاد مشتری',
                description:
                    'Manage customer details, track purchases, and update preferences easily.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.customers.customerDetails',
        path: `${CONCEPTS_PREFIX_PATH}/customers/customer-details/:id`,
        component: lazy(
            () => import('@/views/concepts/collections/CustomerDetails'),
        ),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },

    {
        key: 'concepts.projects.scrumBoard',
        path: `${CONCEPTS_PREFIX_PATH}/projects/scrum-board`,
        component: lazy(() => import('@/views/concepts/projects/ScrumBoard')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.projects.projectList',
        path: `${CONCEPTS_PREFIX_PATH}/projects/project-list`,
        component: lazy(() => import('@/views/concepts/projects/ProjectList')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.projects.projectDetails',
        path: `${CONCEPTS_PREFIX_PATH}/projects/project-details/:id`,
        component: lazy(
            () => import('@/views/concepts/projects/ProjectDetails'),
        ),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.projects.projectTasks',
        path: `${CONCEPTS_PREFIX_PATH}/projects/tasks`,
        component: lazy(() => import('@/views/concepts/projects/Tasks')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.projects.projectIssue',
        path: `${CONCEPTS_PREFIX_PATH}/projects/tasks/:id`,
        component: lazy(() => import('@/views/concepts/projects/Issue')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.orders.orderList',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-list`,
        component: lazy(() => import('@/views/concepts/orders/OrderList')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.orders.orderEdit',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-edit/:id`,
        component: lazy(() => import('@/views/concepts/orders/OrderEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'ویرایش سفارش',
                contained: true,
                description: 'Manage and track orders efficiently',
            },
            footer: false,
        },
    },
    {
        key: 'concepts.orders.orderCreate',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-create`,
        component: lazy(() => import('@/views/concepts/orders/OrderCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'نظم ایجاد کنید',
                contained: true,
                description:
                    'Create new customer orders quickly and accurately',
            },
            footer: false,
        },
    },
    {
        key: 'concepts.orders.orderDetails',
        path: `${CONCEPTS_PREFIX_PATH}/orders/order-details/:id`,
        component: lazy(() => import('@/views/concepts/orders/OrderDetails')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                contained: true,
                title: lazy(
                    () =>
                        import(
                            '@/views/concepts/orders/OrderDetails/components/OrderDetailHeader'
                        ),
                ),
                extraHeader: lazy(
                    () =>
                        import(
                            '@/views/concepts/orders/OrderDetails/components/OrderDetailHeaderExtra'
                        ),
                ),
            },
            pageContainerType: 'contained',
        },
    },
]

export default conceptsRoute
