import { lazy } from 'react'
import { AUTH_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const authDemoRoute: Routes = [
    {
        key: 'authentication.signInSimple',
        path: `${AUTH_PREFIX_PATH}/sign-in-simple`,
        component: lazy(() => import('@/views/auth-demo/SignInDemoSimple')),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.signInSide',
        path: `${AUTH_PREFIX_PATH}/sign-in-side`,
        component: lazy(() => import('@/views/auth-demo/SignInDemoSide')),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.signInSplit',
        path: `${AUTH_PREFIX_PATH}/sign-in-split`,
        component: lazy(() => import('@/views/auth-demo/SignInDemoSplit')),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.signUpSimple',
        path: `${AUTH_PREFIX_PATH}/sign-up-simple`,
        component: lazy(() => import('@/views/auth-demo/SignUpDemoSimple')),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.signUpSide',
        path: `${AUTH_PREFIX_PATH}/sign-up-side`,
        component: lazy(() => import('@/views/auth-demo/SignUpDemoSide')),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.signUpSplit',
        path: `${AUTH_PREFIX_PATH}/sign-up-split`,
        component: lazy(() => import('@/views/auth-demo/SignUpDemoSplit')),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.resetPasswordSimple',
        path: `${AUTH_PREFIX_PATH}/reset-password-simple`,
        component: lazy(
            () => import('@/views/auth-demo/ResetPasswordDemoSimple'),
        ),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.resetPasswordSide',
        path: `${AUTH_PREFIX_PATH}/reset-password-side`,
        component: lazy(
            () => import('@/views/auth-demo/ResetPasswordDemoSide'),
        ),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.resetPasswordSplit',
        path: `${AUTH_PREFIX_PATH}/reset-password-split`,
        component: lazy(
            () => import('@/views/auth-demo/ResetPasswordDemoSplit'),
        ),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.forgotPasswordSimple',
        path: `${AUTH_PREFIX_PATH}/forgot-password-simple`,
        component: lazy(
            () => import('@/views/auth-demo/ForgotPasswordDemoSimple'),
        ),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.forgotPasswordSide',
        path: `${AUTH_PREFIX_PATH}/forgot-password-side`,
        component: lazy(
            () => import('@/views/auth-demo/ForgotPasswordDemoSide'),
        ),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
    {
        key: 'authentication.forgotPasswordSplit',
        path: `${AUTH_PREFIX_PATH}/forgot-password-split`,
        component: lazy(
            () => import('@/views/auth-demo/ForgotPasswordDemoSplit'),
        ),
        authority: [ADMIN, USER],
        meta: {
            layout: 'blank',
            pageContainerType: 'gutterless',
            footer: false,
        },
    },
]

export default authDemoRoute
