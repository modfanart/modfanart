/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import DemoComponentApi from '@/components/docs/DemoComponentApi'

const RouteAndNav = () => {
    return (
        <>
            <p>
                اکمه از{' '}
                <a
                    href="https://reactrouter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    React Router
                </a>{' '}
                به عنوان سیستم مسیریابی اصلی خود استفاده می‌کند. در این راهنما، شما خواهید آموخت که چگونه مسیرهای جدید بسازید و نحوه عملکرد مسیرهای موجود را درک کنید.
            </p>
            <div className="mt-6" id="overview">
                <h5>نمای کلی</h5>
                <p className="my-1">
                    پیکربندی مسیریاب برای قالب در{' '}
                    <code>src/configs/routes.config/index.ts</code> قرار دارد. دو گروه اصلی مسیرها وجود دارد:
                </p>
                <SyntaxHighlighter language="js">{`export const publicRoutes = [
        ...
    ]
    
    export const protectedRoutes = [
        ...
    ]`}</SyntaxHighlighter>
                <ul>
                    <li>
                        <strong>publicRoutes:</strong>
                        <p className="mt-1">
                            این گروه شامل تمام مسیرهایی است که برای همه کاربران قابل دسترسی هستند.
                        </p>
                    </li>
                    <li>
                        <strong>protectedRoutes:</strong>
                        <p className="mt-1">
                            این گروه شامل مسیرهایی است که برای دسترسی به آن‌ها نیاز به احراز هویت است.
                        </p>
                    </li>
                </ul>
            </div>
            <div className="mt-10" id="addingNewRoute">
                <h5>اضافه کردن مسیر جدید</h5>
                <p className="mt-1">
                    برای اضافه کردن یک مسیر جدید، کافی است کد زیر را در گروه مسیر مناسب قرار دهید، بسته به سطح دسترسی که می‌خواهید تخصیص دهید:
                </p>
                <SyntaxHighlighter language="js">{`export const protectedRoutes = [
        {
            key: 'a-unique-id-for-this-view',
            path: 'my-new-view-path',
            component: lazy(() => import('@/views/MyNewComponent')),
            authority: [],
            meta: {
                pageContainerType: 'gutterless'
            }
        },			
    ]`}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="authority">
                <h5>مجازات‌ها</h5>
                <p className="mt-1">
                    مسیرهای اکمه از کنترل دسترسی مبتنی بر نقش ساده پشتیبانی می‌کنند. شما می‌توانید نقش‌هایی که دسترسی به یک مسیر دارند را با استفاده از فیلد <code>authority</code> مشخص کنید. به عنوان مثال، مسیر زیر فقط برای کاربران با نقش{' '}
                    <code>'admin'</code> یا <code>'user'</code> قابل دسترسی است. اگر فیلد <code>authority</code> به صورت آرایه خالی باشد، مسیر برای تمام نقش‌ها باز خواهد بود.
                </p>
                <SyntaxHighlighter language="js">{`export const protectedRoutes = [
        {
            ...
            authority: ['admin', 'user'],
        },			
    ]`}</SyntaxHighlighter>
                <p>
                    <code>AuthorityGuard</code> پیش‌فرض نقش کاربر فعلی را از وضعیت Zustand بررسی می‌کند (
                    <code>auth.user.authority</code>). شما می‌توانید از این به عنوان پایه‌ای برای گسترش یا سفارشی‌سازی کنترل دسترسی خود استفاده کنید.
                </p>
            </div>
            <div className="mt-10" id="meta">
                <h5>متا</h5>
                <p className="mt-1">
                    فیلد <code>meta</code> به شما این امکان را می‌دهد که اطلاعات اضافی را به <code>PageContainer</code> یا کامپوننت نمای مرتبط با مسیر ارسال کنید.
                </p>
                <SyntaxHighlighter language="js">{`export const protectedRoutes = [
        {
            ...
            meta: {
                pageContainerType: 'gutter',
                header: {
                    title: 'My tittle',
                    description: 'Some description'
                    contained: false,
                    extraHeader: lazy(() => import('/SomeComponent')),
                },
                footer: false,
                layout: 'blank',
            }
        },			
    ]`}</SyntaxHighlighter>
                <p>
                    کامپوننت نما قادر خواهد بود به تمام داده‌های <code>meta</code> که مشخص شده‌اند دسترسی پیدا کند.
                </p>
                <DemoComponentApi
                    hideApiTitle
                    keyText="properties"
                    api={[
                        {
                            api: [
                                {
                                    propName: 'pageContainerType',
                                    type: `<code>'default'</code>  | <code>'gutterless'</code> | <code>'contained'</code>`,
                                    default: `<code>'default'</code>`,
                                    desc: 'نوع کانتینر نمای صفحه را تعریف می‌کند',
                                },
                                {
                                    propName: 'pageBackgroundType',
                                    type: `<code>'default'</code>  | <code>'plain'</code>`,
                                    default: '-',
                                    desc: 'نوع پس‌زمینه صفحه را تعیین می‌کند',
                                },
                                {
                                    propName: 'header',
                                    type: `<code> {
                                            title?: string | ReactNode | LazyExoticComponent<() => JSX.Element>
                                            description?: string | ReactNode
                                            contained?: boolean
                                            extraHeader?: string | ReactNode | LazyExoticComponent<() => JSX.Element>
                                        }</code>`,
                                    default: '-',
                                    desc: 'عنوان و تنظیمات بیشتر صفحه را مشخص می‌کند',
                                },
                                {
                                    propName: 'footer',
                                    type: `<code>boolean</code>`,
                                    default: `<code>true</code>`,
                                    desc: 'تعیین می‌کند که آیا فوتر نمایش داده شود یا خیر',
                                },
                                {
                                    propName: 'layout',
                                    type: `<code>'blank'</code>  | <code>'collapsibleSide'</code> | <code>'stackedSide'</code> | <code>'topBarClassic'</code> | <code>'framelessSide'</code> | <code>'contentOverlay'</code>`,
                                    default: `-`,
                                    desc: 'طرح‌بندی فعلی صفحه را برای این صفحه بازنویسی می‌کند',
                                },
                            ],
                        },
                    ]}
                />
            </div>
        </>
    )
}

export default RouteAndNav
