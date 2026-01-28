import { lazy } from 'react'
import { DocumentationRoute } from '@/@types/docs'

const documentationRoutes: DocumentationRoute[] = [
    {
        groupName: 'شروع به کار',
        nav: [
            {
                path: 'introduction',
                label: 'مقدمه',
                component: lazy(() => import('./components/Introduction')),
            },
            {
                path: 'installation',
                label: 'نصب',
                component: lazy(() => import('./components/Installation')),
            },
            {
                path: 'tailwindcss',
                label: 'TailwindCSS',
                component: lazy(() => import('./components/TailwindCss')),
            },
            {
                path: 'css',
                label: 'CSS',
                component: lazy(() => import('./components/Css')),
            },
            {
                path: 'starter',
                label: 'استارت',
                component: lazy(() => import('./components/Starter')),
            },
            {
                path: 'typescript',
                label: 'Typescript',
                component: lazy(() => import('./components/TypeScript')),
            },
            {
                path: 'updating',
                label: 'به‌روزرسانی',
                component: lazy(() => import('./components/Updating')),
            },
        ],
    },
    {
        groupName: 'توسعه',
        nav: [
            {
                path: 'development-server',
                label: 'سرور توسعه',
                component: lazy(() => import('./components/DevelopmentServer')),
            },
            {
                path: 'folder-structure',
                label: 'ساختار پوشه‌ها',
                component: lazy(() => import('./components/FolderStructure')),
            },
            {
                path: 'routing',
                label: 'مسیریابی',
                component: lazy(() => import('./components/Routing')),
            },
            {
                path: 'stateManagement',
                label: 'مدیریت وضعیت',
                component: lazy(() => import('./components/StateManagement')),
            },
            {
                path: 'api-integration',
                label: 'یکپارچگی API',
                component: lazy(() => import('./components/ApiIntegration')),
            },
            {
                path: 'authentication',
                label: 'احراز هویت',
                component: lazy(() => import('./components/Authentication')),
            },
            {
                path: 'mock-api',
                label: 'Mock Api',
                component: lazy(() => import('./components/MockApi')),
            },
            {
                path: 'firebase',
                label: 'Firebase',
                component: lazy(
                    () => import('./components/FirebaseIntegration'),
                ),
            },
        ],
    },
    {
        groupName: 'پیکربندی',
        nav: [
            {
                path: 'app',
                label: 'پیکربندی اپلیکیشن',
                component: lazy(() => import('./components/Application')),
            },
            {
                path: 'layouts',
                label: 'طرح‌بندی‌ها',
                component: lazy(() => import('./components/Layouts')),
            },
            {
                path: 'navigation-config',
                label: 'پیکربندی ناوبری',
                component: lazy(() => import('./components/NavigationConfig')),
            },
            {
                path: 'theming',
                label: 'تم‌ها',
                component: lazy(() => import('./components/ThemeColor')),
            },
            {
                path: 'internationalization',
                label: 'بین‌المللی‌سازی',
                component: lazy(
                    () => import('./components/Internationalization'),
                ),
            },
            {
                path: 'dark-light-mode',
                label: 'حالت تاریک/روشن',
                component: lazy(() => import('./components/DarkLightMode')),
            },
            {
                path: 'direction',
                label: 'جهت‌دهی',
                component: lazy(() => import('./components/Direction')),
            },
            {
                path: 'overall-theme-config',
                label: 'پیکربندی کلی تم',
                component: lazy(
                    () => import('./components/OverallThemeConfig'),
                ),
            },
        ],
    },
    {
        groupName: 'انتشار',
        nav: [
            {
                path: 'build-production',
                label: 'ساخت برای تولید',
                component: lazy(() => import('./components/BuildProduction')),
            },
        ],
    },
    {
        groupName: 'سایر',
        nav: [
            {
                path: 'credit',
                label: 'منابع و اعتبارها',
                component: lazy(() => import('./components/Credit')),
            },
        ],
    },
]

export default documentationRoutes
