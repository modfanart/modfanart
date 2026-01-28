import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import DemoComponentApi from '@/components/docs/DemoComponentApi'

const NavigationConfig = () => {
    return (
        <>
            <p>
                ساختار ناوبری خود را به صورت آرایه‌ای از اشیاء تعریف کرده و در نهایت آن را در رابط کاربری رندر می‌کنیم.
                شما می‌توانید به راحتی ناوبری برنامه را با دسترسی به{' '}
                <code>src/configs/navigation.config/index.ts</code> تغییر داده یا سفارشی کنید.
            </p>
            <p>در اینجا نوع یک آیتم منو آورده شده است</p>
            <SyntaxHighlighter language="ts">{`export type HorizontalMenuMeta = {
        layout: 'default'
    } | {
        layout: 'columns'
        showColumnTitle?: boolean
        columns: 1 | 2 | 3 | 4 | 5
    } | {
        layout: 'tabs'
        columns: 1 | 2 | 3 | 4 | 5
    }
    
    export interface NavigationTree {
        key: string
        path: string
        isExternalLink?: boolean
        title: string
        translateKey: string
        icon: string
        type: 'title' | 'collapse' | 'item'
        authority: string[]
        subMenu: NavigationTree[]
        description?: string
        meta?: {
            horizontalMenu?: HorizontalMenuMeta
            description?: {
                translateKey: string
                label: string
            }
        }
    }
    `}</SyntaxHighlighter>
            <br />
            <DemoComponentApi
                hideApiTitle
                keyText="properties"
                api={[
                    {
                        api: [
                            {
                                propName: 'key',
                                type: `<code>string</code>`,
                                default: `-`,
                                desc: 'یک کلید منحصر به فرد که باید با مسیری که این منو به آن هدایت می‌کند مطابقت داشته باشد',
                            },
                            {
                                propName: 'path',
                                type: `<code>string</code>`,
                                default: '-',
                                desc: 'آدرس URL که این آیتم منو به آن لینک می‌دهد',
                            },
                            {
                                propName: 'isExternalLink',
                                type: `<code>boolean</code>`,
                                default: '-',
                                desc: 'آیا لینک در تب جدید باز می‌شود یا خیر',
                            },
                            {
                                propName: 'title',
                                type: `<code>string</code>`,
                                default: '-',
                                desc: 'متنی که برای این آیتم منو رندر می‌شود',
                            },
                            {
                                propName: 'translateKey',
                                type: `<code>string</code>`,
                                default: '-',
                                desc: 'کلید ترجمه برای ترجمه متن رندر شده در آیتم منو، در صورت خالی یا نامعتبر بودن به <code>title</code> باز می‌گردد',
                            },
                            {
                                propName: 'icon',
                                type: `<code>string</code>`,
                                default: '-',
                                desc: 'آیکون مورد نظر را در آیتم منو رندر می‌کند. مقدار رشته‌ای باید با کلید شیء در <code>navigation-icon.config.tsx</code> مطابقت داشته باشد',
                            },
                            {
                                propName: 'type',
                                type: `<code>'title'</code>  | <code>'collapse'</code> | <code>'item'</code>`,
                                default: `-`,
                                desc: 'برای تعریف نوع آیتم منو فعلی',
                            },
                            {
                                propName: 'authority',
                                type: `<code>string[]</code>`,
                                default: `-`,
                                desc: 'آیتم‌های منو را برای کاربرانی که دارای نقش‌های مشخص شده هستند، نمایش می‌دهد. اگر این فیلد تعریف نشده یا آرایه خالی باشد، هیچ محدودیتی برای دسترسی وجود نخواهد داشت',
                            },
                            {
                                propName: 'subMenu',
                                type: `<code>navigationConfig[]</code>`,
                                default: `-`,
                                desc: `آیا این آیتم منو دارای زیرمنو است، در صورتیکه <code>type</code> برابر با <code>'title'</code> یا <code>'collapse'</code> باشد، این فیلد ویژگی‌های جدول فوق را می‌پذیرد`,
                            },
                            {
                                propName: 'meta',
                                type: `<code> {
            horizontalMenu?: HorizontalMenuMeta
            description?: {
                translateKey: string
                label: string
            }
        }</code>`,
                                default: `-`,
                                desc: `این یک فیلد تنظیمات اختیاری برای ناوبری است که می‌تواند اطلاعات اضافی را در مواقع خاص ارائه دهد`,
                            },
                            {
                                propName: 'meta.horizontalMenu',
                                type: `<code> {
        layout: 'default'
    } | {
        layout: 'columns'
        showColumnTitle?: boolean
        columns: 1 | 2 | 3 | 4 | 5
    } | {
        layout: 'tabs'
        columns: 1 | 2 | 3 | 4 | 5
    }</code>`,
                                default: `-`,
                                desc: `تنظیمات اضافی برای منوی افقی، مانند <code>layout</code>، <code>columns</code> و غیره`,
                            },
                            {
                                propName: 'meta.description',
                                type: `<code>navigationConfig[]</code>`,
                                default: `-`,
                                desc: `توضیحات صفحه، توضیحات فقط زمانی در دسترس هستند که <code>themeConfig.layout.type</code> برابر با <code>'contentOverlay'</code> باشد`,
                            },
                        ],
                    },
                ]}
            />
            <p>یک مثال از تنظیمات ساختار ناوبری</p>
            <SyntaxHighlighter language="ts">{`const navigationConfig = [
        {
            key: 'uiComponent',
            path: '',
            title: 'Ui Component',
            translateKey: 'nav.uiComponents',
            icon: 'uiComponents',
            type: 'title',
            authority: ['admin', 'user'],
            /** می‌توانیم تنظیمات منو را در اینجا تعریف کنیم، اگر از منوی افقی استفاده می‌کنیم */
            meta: {
                horizontalMenu: {
                    layout: 'columns',
                    columns: 4
                }
            },
            subMenu: [
                {
                    key: 'uiComponent.common',
                    path: '',
                    title: 'Common',
                    translateKey: 'nav.uiComponentsCommon.common',
                    icon: 'common',
                    type: 'collapse',
                    authority: ['admin', 'user'],
                    subMenu: [
                        {
                            key: 'uiComponent.common.button',
                            path: '/button',
                            title: 'Button',
                            translateKey: 'nav.uiComponentsCommon.button',
                            icon: '',
                            type: 'item',
                            authority: ['admin', 'user'],
                            subMenu: []
                        },
                        {
                            key: 'uiComponent.common.typography',
                            path: '/typography',
                            title: 'Typography',
                            translateKey: 'nav.uiComponentsCommon.typography',
                            icon: '',
                            type: 'item',
                            authority: ['admin', 'user'],
                            subMenu: []
                        }
                    ]
                }
            ]
        }
    ]`}</SyntaxHighlighter>
            <div className="mt-10" id="configuringNavigationIcon">
                <h5>تنظیم آیکون ناوبری</h5>
                <p className="mt-1">
                    تنظیمات آیکون ناوبری در فایل جداگانه‌ای در{' '}
                    <code>src/configs/navigation-icon.config.tsx</code> قرار دارد
                </p>
                <p>
                    در مثال بالا، از مقدار رشته‌ای{' '}
                    <code>uiComponents</code> در فیلد <code>icon</code> استفاده می‌کنیم،
                    بنابراین باید از این مقدار در{' '}
                    <code>navigation-icon.config.ts</code> برای تعریف آیکون استفاده کنیم.
                </p>
                <p>
                    ابتدا، آیکونی که می‌خواهید را از{' '}
                    <a
                        href="https://react-icons.github.io/react-icons/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        react-icons
                    </a>
                    وارد کنید
                </p>
                <SyntaxHighlighter language="ts">{`import { FaBeer } from 'react-icons/fa'
    
    const navigationIcon = {}
    `}</SyntaxHighlighter>
                <p>
                    حالا مقدار استفاده شده در فیلد <code>icon</code> را به عنوان کلید
                    و کامپوننت آیکون وارد شده را به عنوان مقدار تنظیم کنید
                </p>
                <SyntaxHighlighter language="tsx">{`import { FaBeer } from 'react-icons/fa'
    
    const navigationIcon = {
        uiComponents: <FaBeer />
    }
    `}</SyntaxHighlighter>
                <p>
                    حالا آیتم منو مربوطه آیکون <code>FaBeer</code> را به عنوان آیکون منو رندر خواهد کرد.
                </p>
            </div>
        </>
    )
}

export default NavigationConfig
