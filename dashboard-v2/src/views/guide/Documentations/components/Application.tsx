import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import ReactHtmlParser from 'html-react-parser'
import Table from '@/components/ui/Table'

const { Tr, Th, Td, THead, TBody } = Table

const metadata = {
    api: [
        {
            propName: 'apiPrefix',
            type: `<code>string</code>`,
            defaultDemo: `<code>'/api'</code>`,
            defaultStarter: `<code>'/api'</code>`,
            desc: 'مسیر اصلی برای تمامی درخواست‌های API.',
        },
        {
            propName: 'authenticatedEntryPath',
            type: `<code>string</code>`,
            defaultDemo: `<code>'/app/sales/dashboard'</code>`,
            defaultStarter: `<code>'/home'</code>`,
            desc: 'مسیر به‌محض احراز هویت موفقیت‌آمیز برای هدایت کاربران.',
        },
        {
            propName: 'unAuthenticatedEntryPath',
            type: `<code>string</code>`,
            defaultDemo: `<code>'/sign-in'</code>`,
            defaultStarter: `<code>'/sign-in'</code>`,
            desc: 'مسیر هدایت کاربران در صورت عدم احراز هویت.',
        },
        {
            propName: 'locale',
            type: `<code>string</code>`,
            defaultDemo: `<code>'en'</code>`,
            defaultStarter: `<code>'en'</code>`,
            desc: 'زبان یا منطقه پیش‌فرض برای برنامه.',
        },
        {
            propName: 'enableMock',
            type: `<code>boolean</code>`,
            defaultDemo: '<code>true</code>',
            defaultStarter: '<code>true</code>',
            desc: 'فعال یا غیرفعال کردن درخواست‌های API که به سرور mock هدایت می‌شوند.',
        },
        {
            propName: 'accessTokenPersistStrategy',
            type: `<code>'localStorage' | 'sessionStorage' | 'cookies' </code>`,
            defaultDemo: `<code>'cookies'</code>`,
            defaultStarter: `<code>'cookies'</code>`,
            desc: 'استراتژی ذخیره‌سازی توکن احراز هویت.',
        },
    ],
}

const Application = () => {
    return (
        <>
            <p>
                شما می‌توانید تنظیمات استاتیک مختلف برنامه را در{' '}
                <code>src/configs/app.config.ts</code> پیکربندی کنید. در زیر
                تنظیمات پیش‌فرض برای نسخه‌های دمو و استارتر آورده شده است.
            </p>
            <span>
                <i>تنظیمات دمو</i>
            </span>
            <SyntaxHighlighter language="ts">{`const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/app/sales/dashboard',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    enableMock: true
}`}</SyntaxHighlighter>
            <span>
                <i>تنظیمات استارتر</i>
            </span>
            <SyntaxHighlighter language="ts">{`const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    enableMock: true
}`}</SyntaxHighlighter>
            <h5 className="-mb-2 mt-6">متادیتای پیکربندی</h5>
            <Table className="demo-api-table">
                <THead>
                    <Tr>
                        <Th>ویژگی</Th>
                        <Th>توضیح</Th>
                        <Th>نوع</Th>
                        <Th>پیش‌فرض (دمو)</Th>
                        <Th>پیش‌فرض (استارتر)</Th>
                    </Tr>
                </THead>
                <TBody>
                    {metadata.api.map((item) => (
                        <Tr key={`row-${item.propName}`}>
                            <Td className="font-semibold">{item.propName}</Td>
                            <Td>{ReactHtmlParser(item.desc)}</Td>
                            <Td>{ReactHtmlParser(item.type)}</Td>
                            <Td>{ReactHtmlParser(item.defaultDemo)}</Td>
                            <Td>{ReactHtmlParser(item.defaultStarter)}</Td>
                        </Tr>
                    ))}
                </TBody>
            </Table>
        </>
    )
}


export default Application
