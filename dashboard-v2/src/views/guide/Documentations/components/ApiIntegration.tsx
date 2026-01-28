import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import Alert from '@/components/ui/Alert'

const ApiIntegration = () => {
    return (
        <>
            <p>
                در این راهنما، شما یاد خواهید گرفت که چگونه API پشتیبان خود را با قالب ادغام کنید.
                ما همه چیز از پیکربندی محیط گرفته تا راه‌اندازی پراکسی و ایجاد فایل‌های سرویس برای ارتباط بی‌وقفه با API را پوشش خواهیم داد.
            </p>

            <div className="mt-10" id="turningOffMockApi">
                <h5 className="mb-4">غیرفعال کردن API ساختگی</h5>
                <Alert showIcon type="info" title="مهم:">
                    قبل از شروع، مطمئن شوید که API ساختگی را با تنظیم <code>enableMock</code> به <code>false</code> در{' '}
                    <code>src/configs/app.config.ts</code> غیرفعال کرده‌اید. قالب به‌طور پیش‌فرض از API ساختگی استفاده می‌کند، بنابراین غیرفعال کردن آن به اپلیکیشن شما این امکان را می‌دهد که به سرور واقعی خود وصل شود.
                </Alert>
            </div>
            <div className="mt-10" id="proxying">
                <h5>راه‌اندازی پراکسی</h5>
                <p className="mt-1">
                    اگر API پشتیبان شما روی سرور متفاوتی از فرانت‌اند شما قرار دارد، باید پراکسی راه‌اندازی کنید تا از مشکلات درخواست‌های میان‌مرزی (CORS) جلوگیری شود. می‌توانید پراکسی را از طریق فایل <code>package.json</code> یا از طریق <code>vite.config.ts</code> برای انعطاف‌پذیری بیشتر پیکربندی کنید.
                </p>
                <ul>
                    <li>
                        <strong>گزینه 1: راه‌اندازی دستی در Vite</strong>
                        <p className="mt-1">
                            برای راه‌اندازی سفارشی‌تر، پراکسی را در <code>vite.config.ts</code> پیکربندی کنید:
                        </p>
                        <SyntaxHighlighter language="ts">{`export default defineConfig({
        plugins: ...,
        server: {
            proxy: {
                '/api': {
                    // آدرس URL سرور بک‌اند خود را به‌روزرسانی کنید
                    target: 'http://yourDevDomain.com',
                    changeOrigin: true,
                    secure: false,
                }
            }
        }
    })`}</SyntaxHighlighter>
                    </li>
                    <li>
                        <strong>گزینه 2: استفاده از package.json</strong>
                        <p className="mt-1">
                            برای راه‌اندازی سریع پراکسی، خط زیر را به فایل <code>package.json</code> اضافه کنید:
                        </p>
                        <SyntaxHighlighter language="json">{`"proxy": "http://yourDevDomain.com"`}</SyntaxHighlighter>
                    </li>
                </ul>
            </div>
            <div className="mt-10" id="configureApiPrefix">
                <h5>پیکربندی پیشوند API</h5>
                <p>
                    می‌توانید پیشوندی برای انتهای API خود در <code>src/configs/app.config.ts</code> با استفاده از ویژگی{' '}
                    <code>apiPrefix</code> تعریف کنید. این پیشوند به تمامی درخواست‌های API اضافه خواهد شد و ساختار API شما را منظم و قابل مدیریت نگه می‌دارد.
                </p>
                <SyntaxHighlighter language="ts">{`const appConfig: AppConfig = {
        apiPrefix: '/api',
        // سایر پیکربندی‌ها...
    }`}</SyntaxHighlighter>
            </div>

            <div className="mt-10" id="integration">
                <h5>ادغام گام‌به‌گام</h5>
            </div>

            <p>مراحل زیر را برای راه‌اندازی ارتباط با API پشتیبان دنبال کنید:</p>
            <ol>
                <li>
                    <p>
                        ابتدا یک فایل سرویس جدید مخصوص ویژگی یا ماژول خود ایجاد کنید. به عنوان مثال، اگر روی مدیریت کاربران کار می‌کنید، فایلی به نام{' '}
                        <code>UserManagementService.ts</code> در دایرکتوری <code>services</code> ایجاد کنید.
                    </p>
                </li>
                <li>
                    <p>
                        داخل فایل سرویس، یک تابع ناهمگام برای انجام درخواست API اعلام کنید. این تابع باید از <code>ApiService.fetchData</code> استفاده کند و دو نوع جنریک: <strong>Response</strong> و{' '}
                        <strong>Request</strong> به همراه پیکربندی Axios را بپذیرد. در اینجا یک مثال آورده شده است:
                    </p>
                    <SyntaxHighlighter language="ts">{`type MyApiResponse = {
        someResponseData: string
        someResponseData2: boolean
    }
    
    type MyApiRequest = {
        someRequestData: string
    }
    
    export async function myApi (data) {
        return ApiService.fetchData<MyApiResponse,MyApiRequest>({
            url: '/my-api-url',
            method: 'post',
            data
        })
    }
    ...`}</SyntaxHighlighter>
                    <p>
                        یا ارسال نوع به صورت جنریک از سطح مصرف‌کننده:
                    </p>
                    <SyntaxHighlighter language="ts">{`import ApiService from "./ApiService"
    
    export async function myApi<TResponse, TRequest>(data) {
        return ApiService.fetchData<TResponse, TRequest>({
            url: '/my-api-url',
            method: 'post',
            data
        })
    }
    ...`}</SyntaxHighlighter>
                </li>
                <li>
                    <p>حالا می‌توانید این API را در کامپوننت خود وصل کنید:</p>
                    <SyntaxHighlighter language="tsx">{`
    type MyApiResponse = {
        someResponseData: string
        someResponseData2: boolean
    }
    
    type MyApiRequest = {
        someRequestData: string
    }
    
    import { myApi } from './MyService.ts'
    
    const MyComponent = props => {
    
        const fetchData = async () => {
            const reqeustParam = { key: 'value' }
            try {
                const resp = await myApi<MyApiResponse, MyApiRequest>(reqeustParam)
                if (resp.data) {
                    ...do something
                }
            } catch (errors) {
                ...handle errors
            }
        }
        
        useEffect(() => {
            fetchData()
        }, [])
    
        return (
        ...
    )`}</SyntaxHighlighter>
                    <p>
                        <strong>توجه داشته باشید</strong>: شما همچنین می‌توانید از کتابخانه‌های دریافت داده مانند{' '}
                        <a href="https://swr.vercel.app/" target="_blank" rel="noreferrer">
                            SWR
                        </a>{' '}
                        یا{' '}
                        <a href="https://tanstack.com/query/latest" target="_blank" rel="noreferrer">
                            TanStack Query
                        </a>{' '}
                        برای رویکردی دکلاکتیو در دریافت داده‌ها استفاده کنید. انتخاب به نیازهای خاص شما بستگی دارد.
                    </p>
                </li>
            </ol>
        </>
    )
}

export default ApiIntegration
