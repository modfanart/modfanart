import { lazy } from 'react'
import { DocumentationRoute } from '@/@types/docs'

const documentationRoutes: DocumentationRoute[] = [
    {
        groupName: 'کامپوننت‌ها',  // ترجمه گروه
        nav: [
            {
                path: 'abbreviate-number',
                label: 'شمارش کوتاه',  // ترجمه برچسب
                component: lazy(
                    () => import('./components/AbbreviateNumberDoc'),
                ),
            },
            {
                path: 'action-link',
                label: 'لینک اکشن',  // ترجمه برچسب
                component: lazy(() => import('./components/ActionLinkDoc')),
            },
            {
                path: 'adaptive-card',
                label: 'کارت سازگار',  // ترجمه برچسب
                component: lazy(() => import('./components/AdaptiveCardDoc')),
            },
            {
                path: 'affix',
                label: 'افیکس',  // ترجمه برچسب
                component: lazy(() => import('./components/AffixDoc')),
            },
            {
                path: 'authority-check',
                label: 'بررسی اختیارات',  // ترجمه برچسب
                component: lazy(() => import('./components/AuthorityCheckDoc')),
            },
            {
                path: 'calendar-view',
                label: 'نمای تقویم',  // ترجمه برچسب
                component: lazy(() => import('./components/CalendarViewDoc')),
            },
            {
                path: 'chart',
                label: 'نمودار',  // ترجمه برچسب
                component: lazy(() => import('./components/ChartDoc')),
            },
            {
                path: 'confirm-dialog',
                label: 'گفتگوی تایید',  // ترجمه برچسب
                component: lazy(() => import('./components/ConfirmDialogDoc')),
            },
            {
                path: 'container',
                label: 'ظرف',  // ترجمه برچسب
                component: lazy(() => import('./components/ContainerDoc')),
            },
            {
                path: 'custom-format-input',
                label: 'ورودی با قالب سفارشی',  // ترجمه برچسب
                component: lazy(
                    () => import('./components/CustomFormatInputDoc'),
                ),
            },
            {
                path: 'data-table',
                label: 'جدول داده‌ها',  // ترجمه برچسب
                component: lazy(() => import('./components/DataTableDoc')),
            },
            {
                path: 'debounce-input',
                label: 'ورودی دیبونس',  // ترجمه برچسب
                component: lazy(() => import('./components/DebounceInputDoc')),
            },
            {
                path: 'double-sided-image',
                label: 'تصویر دو طرفه',  // ترجمه برچسب
                component: lazy(
                    () => import('./components/DoubleSidedImageDoc'),
                ),
            },
            {
                path: 'ellipsis-button',
                label: 'دکمه سه نقطه',  // ترجمه برچسب
                component: lazy(() => import('./components/EllipsisButtonDoc')),
            },
            {
                path: 'gantt-chart',
                label: 'نمودار گانت',  // ترجمه برچسب
                component: lazy(() => import('./components/GanttChartDoc')),
            },
            {
                path: 'grow-shrink-value',
                label: 'مقدار رشد و انقباض',  // ترجمه برچسب
                component: lazy(
                    () => import('./components/GrowShrinkValueDoc'),
                ),
            },
            {
                path: 'icon-text',
                label: 'متن با آیکن',  // ترجمه برچسب
                component: lazy(() => import('./components/IconTextDoc')),
            },
            {
                path: 'image-gallery',
                label: 'گالری تصاویر',  // ترجمه برچسب
                component: lazy(() => import('./components/ImageGalleryDoc')),
            },
            {
                path: 'loading',
                label: 'در حال بارگذاری',  // ترجمه برچسب
                component: lazy(() => import('./components/LoadingDoc')),
            },
            {
                path: 'masonry',
                label: 'آجرچینی',  // ترجمه برچسب
                component: lazy(() => import('./components/MasonryDoc')),
            },
            {
                path: 'media-skeleton',
                label: 'اسکلت مدیا',  // ترجمه برچسب
                component: lazy(() => import('./components/MediaSkeletonDoc')),
            },
            {
                path: 'nav-toggle',
                label: 'تغییر وضعیت ناوبری',  // ترجمه برچسب
                component: lazy(() => import('./components/NavToggleDoc')),
            },
            {
                path: 'numeric-input',
                label: 'ورودی عددی',  // ترجمه برچسب
                component: lazy(() => import('./components/NumericInputDoc')),
            },
            {
                path: 'password-input',
                label: 'ورودی رمز عبور',  // ترجمه برچسب
                component: lazy(() => import('./components/PasswordInputDoc')),
            },
            {
                path: 'pattern-input',
                label: 'ورودی الگو',  // ترجمه برچسب
                component: lazy(() => import('./components/PatternInputDoc')),
            },
            {
                path: 'region-map',
                label: 'نقشه منطقه',  // ترجمه برچسب
                component: lazy(() => import('./components/RegionMapDoc')),
            },
            {
                path: 'rich-text-editor',
                label: 'ویرایشگر متن غنی',  // ترجمه برچسب
                component: lazy(() => import('./components/RichTextEditorDoc')),
            },
            {
                path: 'preset-segment-item-option',
                label: 'گزینه آیتم بخش پیش‌فرض',  // ترجمه برچسب
                component: lazy(
                    () => import('./components/PresetSegmentItemOptionDoc'),
                ),
            },
            {
                path: 'sticky-footer',
                label: 'فوتر چسبنده',  // ترجمه برچسب
                component: lazy(() => import('./components/StickyFooterDoc')),
            },
            {
                path: 'syntax-highlighter',
                label: 'نوار برجسته‌سازی نحو',  // ترجمه برچسب
                component: lazy(
                    () => import('./components/SyntaxHighlighterDoc'),
                ),
            },
            {
                path: 'users-avatar-group',
                label: 'گروه آواتار کاربران',  // ترجمه برچسب
                component: lazy(
                    () => import('./components/UsersAvatarGroupDoc'),
                ),
            },
        ],
    },
]


export default documentationRoutes
