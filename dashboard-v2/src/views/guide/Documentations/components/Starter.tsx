/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import { NavLink } from 'react-router-dom'

const Starter = () => {
    return (
        <>
            <p>
                همانطور که در بخش{' '}
                <NavLink to="/docs/documentation/installation">
                    نصب
                </NavLink>{' '}
                اشاره شده است، ما نسخه‌ای ابتدایی با اجزای اصلی و تنظیمات عملکرد پایه ارائه داده‌ایم. ما به شدت توصیه می‌کنیم که توسعه‌دهندگان از این نسخه به عنوان اساس برای ساخت برنامه‌های خود استفاده کنند.
            </p>
            <p>
                زمانی که پکیج ابتدایی را در محیط محلی خود باز می‌کنید، به صفحه ورود هدایت می‌شوید. شما می‌توانید با استفاده از اطلاعات ورود زیر وارد شوید: <i>کاربر: admin | رمز عبور: 123Qwe</i>.
            </p>
            <i>
                توجه: نسخه ابتدایی به طور پیش‌فرض API ساختگی را فعال کرده است.
                تمام درخواست‌های API به سرور ساختگی ارسال خواهند شد. اگر می‌خواهید این ویژگی را غیرفعال کنید یا در مورد API ساختگی بیشتر بدانید، مستندات{' '}
                <NavLink to="/docs/documentation/mock-api">API ساختگی</NavLink>{' '}
                را بررسی کنید.
            </i>
            <div className="mt-10" id="defaultConfig">
                <h5>تنظیمات پیش‌فرض</h5>
                <p>
                    در زیر برخی از تنظیمات پیش‌فرض برای نسخه ابتدایی آورده شده است. شما می‌توانید این تنظیمات را متناسب با نیازهای خود تغییر دهید.
                </p>
                <p className="mb-2">
                    <strong>AppConfig</strong> -{' '}
                    <NavLink to="/docs/documentation/app">
                        مستندات
                    </NavLink>
                </p>
                <SyntaxHighlighter language="js">{`const appConfig: AppConfig = {
        apiPrefix: '/api',
        authenticatedEntryPath: '/dashboards/ecommerce',
        unAuthenticatedEntryPath: '/sign-in',
        locale: 'en',
        enableMock: true,
    }
    `}</SyntaxHighlighter>
                <p className="mb-2">
                    <strong>ThemeConfig</strong> -{' '}
                    <NavLink to="/docs/documentation/overall-theme-config">
                        مستندات
                    </NavLink>
                </p>
                <SyntaxHighlighter language="js">{`export const themeConfig: ThemeConfig = {
        schema: 'default',
        direction: THEME_ENUM.DIR_LTR,
        mode: THEME_ENUM.MODE_LIGHT,
        panelExpand: false,
        controlSize: 'md',
        layout: {
            type: THEME_ENUM.LAYOUT_COLLAPSIBLE_SIDE,
            sideNavCollapse: false,
        },
    `}</SyntaxHighlighter>
                <p className="mb-2">
                    <strong>RoutesConfig</strong> -{' '}
                    <NavLink to="/docs/documentation/routing">
                        مستندات
                    </NavLink>
                </p>
                <SyntaxHighlighter language="js">{`const publicRoutes = [
        {
            key: 'signIn',
            path: '/sign-in',
            component: lazy(() => import('@/views/auth/SignIn')),
            authority: [],
        },
        {
            key: 'signUp',
            path: '/sign-up',
            component: lazy(() => import('@/views/auth/SignUp')),
            authority: [],
        },
        {
            key: 'forgotPassword',
            path: '/forgot-password:id',
            component: lazy(() => import('@/views/auth/ForgotPassword')),
            authority: [],
        },
        {
            key: 'resetPassword',
            path: '/reset-password',
            component: lazy(() => import('@/views/auth/ResetPassword')),
            authority: [],
        },
    ]
    
    export const protectedRoutes = [
        {
            key: 'home',
            path: '/home',
            component: lazy(() => import('@/views/Home')),
            authority: [],
        },
    ]
    `}</SyntaxHighlighter>
                <p className="mb-2">
                    <strong>NavConfig</strong> -{' '}
                    <NavLink to="/docs/documentation/routing">
                        مستندات
                    </NavLink>
                </p>
                <SyntaxHighlighter language="js">{`const navigationConfig = [
        {
            key: 'home',
            path: '/home',
            title: 'خانه',
            translateKey: 'nav.home',
            icon: 'home',
            type: NAV_ITEM_TYPE_ITEM,
            authority: [],
            subMenu: []
        },
    ]
    `}</SyntaxHighlighter>
            </div>
        </>
    )
}

export default Starter
