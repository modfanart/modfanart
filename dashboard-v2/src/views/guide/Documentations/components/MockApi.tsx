import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const MockApi = () => {
    return (
        <>
            <p>
                یک API شبیه‌سازی شده ابزاری است که رفتار یک API واقعی را شبیه‌سازی می‌کند و پاسخ‌های داده‌شده را به‌طوری که انگار از یک سرور واقعی آمده است، ارائه می‌دهد. این ابزار در موقعیت‌هایی که API واقعی هنوز به‌طور کامل توسعه نیافته یا زمانی که نیاز به شبیه‌سازی تماس‌های API برای تست واحد دارید، بسیار مفید است.
            </p>
            <p>
                اکمه از کتابخانه{' '}
                <a
                    href="https://github.com/ctimmerm/axios-mock-adapter"
                    target="_blank"
                    rel="noreferrer"
                >
                    axios-mock-adapter
                </a>{' '}
                برای مدیریت شبیه‌سازی API استفاده می‌کند. تمام تعاملات API در دمو ما از طریق این آداپتور انجام می‌شود.
            </p>
            <div className="mt-10" id="disableMockApi">
                <h5>غیرفعال کردن Mock API</h5>
                <p className="mt-1">
                    به‌طور پیش‌فرض، API شبیه‌سازی شده در{' '}
                    <strong>starter-kit</strong> فعال است. اگر می‌خواهید آن را غیرفعال کنید، کافی است فیلد <code>enableMock</code> را در{' '}
                    <code>src/configs/app.config.ts</code> برابر با <code>false</code> تنظیم کنید.
                </p>
                <SyntaxHighlighter language="ts">{`const appConfig = {
        ...,
        enableMock: false
    }`}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="usingMockApi">
                <h5>استفاده از Mock API</h5>
                <p className="mt-1">
                    اگر قصد دارید از API شبیه‌سازی شده استفاده کنید، مراحل زیر را برای ایجاد داده‌های پایگاه‌داده جعلی و API ها دنبال کنید:
                </p>
                <ol>
                    <li>
                        <strong>راه‌اندازی</strong>
                        <p className="mt-1">
                            به <code>src/mock/MockAdapter.ts</code> بروید. این فایل شامل پیکربندی پایه برای API شبیه‌سازی شده است.
                        </p>
                        <SyntaxHighlighter language="ts">{`import MockAdapter from 'axios-mock-adapter'
    import AxiosBase from '@/services/axios/AxiosBase'
    
    export const mock = new MockAdapter(AxiosBase)`}</SyntaxHighlighter>
                    </li>
                    <li>
                        <strong>ایجاد یک Mock API</strong>
                        <p className="mt-1">
                            برای ایجاد یک API شبیه‌سازی شده، آن را به <code>src/mock/MockAdapter.ts</code> اضافه کنید. به‌عنوان مثال، می‌توانید <code>userFakeApi.ts</code> را ایجاد کنید. به یاد داشته باشید که باید نمونه شبیه‌سازی را از{' '}
                            <code>MockAdapter.ts</code> وارد کرده و یک مسیر ایجاد کنید.
                        </p>
                        <SyntaxHighlighter language="ts">{`import { mock } from '../MockAdapter'
    
    mock.onGet('/api/users').reply(() => {
        return [200, [
            {
                id: '1',
                name: 'Carolyn Perkins',
            },
            {
                id: '2',
                name: 'Terrance Moreno',
            },
            {
                id: '3',
                name: 'Ron Vargas',
            },
        ]];
    })`}</SyntaxHighlighter>
                    </li>
                    <li>
                        <p>
                            سپس فایل <code>userFakeApi.ts</code> خود را به فایل ورودی شبیه‌سازی <code>src/mock/index.ts</code> وارد کنید.
                        </p>
                        <SyntaxHighlighter language="ts">{`import { mock } from './MockAdapter'
    import './fakeApi/userFakeApi'
    ...
    
    mock.onAny().passThrough();`}</SyntaxHighlighter>
                    </li>
                </ol>
            </div>
            <div>
                <p>
                    حالا می‌توانید درخواست‌هایی به این API شبیه‌سازی شده ارسال کرده و داده‌های استاتیکی که به عنوان پاسخ تنظیم کرده‌اید، دریافت کنید.
                </p>
                <SyntaxHighlighter language="ts">{`// service
    import ApiService from "./ApiService"
    
    type GetUserResponse = {
        id: string
        name: string
        email: string
    }[]
    
    export async function apiGetUsers () {
        return ApiService.fetchData<GetUserResponse>({
            url: '/api/getUsers',
            method: 'get'
        })
    }`}</SyntaxHighlighter>
                <SyntaxHighlighter language="ts">{`// component
    import { useEffect } from 'react'
    import { apiGetUsers } from './YourService.ts'
    
    const YourComponent = () => {
    
        const fetchData = async () => {
            try {
                const resp = await apiGetUsers()
                console.log(resp.data)
            } catch (errors) {
                // handle errors
            }
        }
    
        useEffect(() => {
            fetchData()
        }, [])
    
        return (
            // your component JSX
        )
    }`}</SyntaxHighlighter>
            </div>
            <p>
                برای اطلاعات بیشتر در مورد استفاده از <code>axios-mock-adapter</code>، به{' '}
                <a
                    href="https://github.com/ctimmerm/axios-mock-adapter"
                    target="_blank"
                    rel="noreferrer"
                >
                    مخزن رسمی GitHub
                </a>
                مراجعه کنید.
            </p>
        </>
    )
}

export default MockApi
