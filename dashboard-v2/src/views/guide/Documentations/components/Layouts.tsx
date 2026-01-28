import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import DemoComponentApi from '@/components/docs/DemoComponentApi'
import type { CSSProperties } from 'react'

const Layouts = () => {
    return (
        <>
            <p>
                اکمه 6 نوع چیدمان بعد از ورود به سیستم و 3 نوع چیدمان احراز هویت ارائه می‌دهد. تمامی کامپوننت‌های چیدمان در دایرکتوری{' '}
                <code>src/components/layouts/PostLoginLayout/components*</code> قرار دارند و تمامی کامپوننت‌هایی که در چیدمان‌ها استفاده شده‌اند در{' '}
                <code>src/components/template/*</code> یافت می‌شوند.
            </p>
            <p>چیدمان‌های بعد از ورود به سیستم به شرح زیر بودند:</p>
            <ul>
                <li>
                    کناری قابل جمع شدن - <code>&apos;collapsibleSide&apos;</code>
                </li>
                <li>
                    کناری به‌هم‌چیده - <code>&apos;stackedSide&apos;</code>
                </li>
                <li>
                    نوار بالای کلاسیک - <code>&apos;topBarClassic&apos;</code>
                </li>
                <li>
                    کناری بدون قاب - <code>&apos;framelessSide&apos;</code>
                </li>
                <li>
                    پوشش محتوایی - <code>&apos;contentOverlay&apos;</code>
                </li>
                <li>
                    خالی - <code>&apos;blank&apos;</code>
                </li>
            </ul>
            <div className="mt-10" id="configuringLayout">
                <div className="mt-10" id="classic">
                    <h5>پیکربندی چیدمان</h5>
                    <p className="mt-1">
                        شما می‌توانید چیدمان اولیه را در{' '}
                        <code>src/configs/theme.config.ts</code> با استفاده از مقدار رشته‌ای که در بالا ذکر شد، پیکربندی کنید.
                    </p>
                    <SyntaxHighlighter language="js">{`export const themeConfig = {
        ...
        layout: {
            type: 'framelessSide',
            ...
        },
    }`}</SyntaxHighlighter>
                    <p>
                        در اینجا مقادیر و کلیدهای موجود برای پیکربندی فیلد <code>layout</code> آمده است.
                    </p>
                    <DemoComponentApi
                        hideApiTitle
                        keyText="properties"
                        api={[
                            {
                                api: [
                                    {
                                        propName: 'type',
                                        type: `<code>'blank'</code>  | <code>'collapsibleSide'</code> | <code>'stackedSide'</code> | <code>'topBarClassic'</code> | <code>'framelessSide'</code> | <code>'contentOverlay'</code>`,
                                        default: `<code>'modern'</code>`,
                                        desc: 'نوع چیدمان برنامه',
                                    },
                                    {
                                        propName: 'sideNavCollapse',
                                        type: `<code>boolean</code>`,
                                        default: `<code>false</code>`,
                                        desc: `آیا ناوبری کناری باید جمع شود (فقط زمانی که <code>type</code> برابر با <code>'classic'</code> یا <code>'modern'</code> است)`,
                                    },
                                ],
                            },
                        ]}
                    />
                </div>
            </div>
            <div className="mt-10" id="overridingLayouts">
                <h5>بازنویسی چیدمان‌ها</h5>
                <p className="mt-1">
                    به طور کلی، تمام نمای صفحات بر اساس تنظیمات چیدمان در <code>theme.config.ts</code> دنبال خواهند شد. با این حال، اگر مواردی وجود داشته باشد که بخواهید در یک نمای مسیر خاص چیدمان متفاوتی نمایش دهید، می‌توانید مقدار چیدمان مورد نظر را در <code>meta</code> مسیر برای بازنویسی چیدمان جاری، همانطور که در راهنمای <strong>مسیر یابی</strong> ذکر شده است، تنظیم کنید.
                </p>
                <SyntaxHighlighter language="js">{`export const protectedRoutes = [
        {
            key: 'a-unique-id-for-this-view'
            path: 'path',
            component: React.lazy(() => import('views/Component')),
            authority: [],
            meta: {
                ...,
                layout: 'blank'
            }
        },			
    ]`}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="authLayouts">
                <h5>چیدمان‌های احراز هویت</h5>
                <p>
                    پیکربندی چیدمان احراز هویت کمی متفاوت است. کافی است به{' '}
                    <code>src/components/layouts/AuthLayout/AuthLayout.ts</code> مراجعه کنید و کامپوننت wrapper را تغییر دهید. به عنوان مثال، تغییر{' '}
                    <code>side</code> به <code>simple</code>
                </p>
                <SyntaxHighlighter
                    language="js"
                    wrapLines={true}
                    showLineNumbers={true}
                    lineProps={(lineNumber) => {
                        const style: CSSProperties = { display: 'block' }
                        if ([9].includes(lineNumber)) {
                            style.backgroundColor = '#00ff002e'
                        } else if ([10].includes(lineNumber)) {
                            style.backgroundColor = '#ff00001f'
                        }
                        return { style }
                    }}
                >{`import { useMemo, lazy } from 'react'
    import type { CommonProps } from '@/@types/common'
    import type { LazyExoticComponent } from 'react'
    
    type LayoutType = 'simple' | 'split' | 'side'
    
    type Layouts = Record<LayoutType, LazyExoticComponent<<T extends CommonProps>(props: T) => JSX.Element>>
    
    const currentLayoutType: LayoutType = 'side'
    const currentLayoutType: LayoutType = 'simple'
    
    const layouts: Layouts = {
        simple: lazy(() => import('./Simple')),
        split: lazy(() => import('./Split')),
        side: lazy(() => import('./Side')),
    }
    
    const AuthLayout = ({ children }: CommonProps) => {
    
        const Layout = useMemo(() => {
            return layouts[currentLayoutType]
        }, [])
    
        return (
            <Layout>{children}</Layout>
        )
    }
    
    export default AuthLayout`}</SyntaxHighlighter>
            </div>
        </>
    )
}

export default Layouts
