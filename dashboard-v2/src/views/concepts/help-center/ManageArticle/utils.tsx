import type { ReactNode } from 'react'
import {
    TbPresentation,
    TbSettings,
    TbStar,
    TbLicense,
    TbChartHistogram,
    TbChartPie,
    TbRobotFace,
    TbLibraryPhoto,
    TbShieldCheck,
    TbRefreshDot,
    TbPalette,
    TbCoins,
} from 'react-icons/tb'

export const categoryIcon: Record<string, ReactNode> = {
    introduction: <TbPresentation />,
    setupGuide: <TbSettings />,
    basicFeatures: <TbStar />,
    survey: <TbLicense />,
    analytic: <TbChartHistogram />,
    dataVisualization: <TbChartPie />,
    chatbot: <TbRobotFace />,
    media: <TbLibraryPhoto />,
    security: <TbShieldCheck />,
    integration: <TbRefreshDot />,
    themes: <TbPalette />,
    commission: <TbCoins />,
}

export const categoryLabel: Record<string, string> = {
    introduction: 'مقدمه',
    setupGuide: 'راهنمای نصب',
    basicFeatures: 'ویژگی‌های پایه',
    survey: 'نظرسنجی',
    analytic: 'تحلیل',
    dataVisualization: 'تصویرسازی داده',
    chatbot: 'چت‌بات',
    media: 'رسانه',
    security: 'امنیت',
    integration: 'یکپارچه‌سازی',
    themes: 'پوسته‌ها',
    commission: 'کمیسیون',
}

export const categoryClass: Record<string, string> = {
    introduction: 'bg-sky-200 dark:bg-sky-200',
    setupGuide: 'bg-red-200 dark:bg-red-200',
    basicFeatures: 'bg-amber-200 dark:bg-amber-200',
    survey: 'bg-orange-200 dark:bg-orange-200',
    analytic: 'bg-teal-200 dark:bg-teal-200',
    dataVisualization: 'bg-cyan-200 dark:bg-cyan-200',
    chatbot: 'bg-yellow-200 dark:bg-yellow-200',
    media: 'bg-rose-200 dark:bg-rose-200',
    security: 'bg-emerald-200 dark:bg-emerald-200',
    integration: 'bg-purple-200 dark:bg-purple-200',
    themes: 'bg-sky-200 dark:bg-sky-200',
    commission: 'bg-indigo-200 dark:bg-indigo-200',
}

export const categoryOption = [
    { label: 'مقدمه', value: 'introduction' },
    { label: 'راهنمای نصب', value: 'setupGuide' },
    { label: 'ویژگی‌های پایه', value: 'basicFeatures' },
    { label: 'نظرسنجی', value: 'survey' },
    { label: 'تحلیل', value: 'analytic' },
    { label: 'تصویرسازی داده', value: 'dataVisualization' },
    { label: 'چت‌بات', value: 'chatbot' },
    { label: 'رسانه', value: 'media' },
    { label: 'امنیت', value: 'security' },
    { label: 'یکپارچه‌سازی', value: 'integration' },
    { label: 'پوسته‌ها', value: 'themes' },
    { label: 'کمیسیون', value: 'commission' },
]

