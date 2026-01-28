/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const StateManagement = () => {
    return (
        <>
            <p>
                در این الگو، ما از Zustand برای مدیریت وضعیت استفاده کرده‌ایم.
                Zustand یک راه‌حل مدیریت وضعیت کوچک، سریع و مقیاس‌پذیر است
                که به شما این امکان را می‌دهد که وضعیت را خارج از درخت کامپوننت React
                مدیریت کنید، که این یک روش کارآمدتر برای مدیریت وضعیت جهانی
                در سراسر برنامه شما فراهم می‌کند.
            </p>
            <p>
                ما از Zustand برای مدیریت برخی از وضعیت‌های اصلی در الگو استفاده می‌کنیم،
                اما این کاملاً اختیاری است و شما می‌توانید به راحتی از آن
                در پروژه‌های خود استفاده کنید. اگر ترجیح می‌دهید از کتابخانه دیگری
                برای مدیریت وضعیت یا حتی از وضعیت داخلی React استفاده کنید،
                می‌توانید به راحتی به آن چیزی که بهترین مناسب شما است تغییر دهید.
            </p>
            <div className="mt-10" id="creating-zustand-state">
                <h5>ایجاد وضعیت در Zustand</h5>
                <p>
                    ایجاد یک store در Zustand بسیار ساده است. در زیر مثالی آورده شده
                    است که نحوه ایجاد وضعیت جهانی برای مدیریت یک شمارنده ساده را نشان می‌دهد:
                </p>
                <SyntaxHighlighter language="typescript">
                    {`import create from 'zustand'
    
    type CouterState = {
        count: number
    }
    
    type CouterAction = {
        increaseCount: () => void
        decreaseCount: () => void
    }
    
    // تعریف store
    const useCounterStore = create<CouterState & CouterAction>((set) => ({
        count: 0,
        increaseCount: () => set((state) => ({ count: state.count + 1 })),
        decreaseCount: () => set((state) => ({ count: state.count - 1 })),
    }))
    
    export default useCounterStore`}
                </SyntaxHighlighter>
                <p>
                    در این مثال، ما یک store با وضعیت <code>count</code> و دو اکشن{' '}
                    <code>increaseCount</code> و <code>decreaseCount</code> ایجاد کرده‌ایم.
                    این اکشن‌ها وضعیت را با افزایش یا کاهش <code>count</code> به‌روز می‌کنند.
                </p>
            </div>
            <div className="mt-10" id="using-zustand-state">
                <h5>استفاده از وضعیت Zustand در یک کامپوننت</h5>
                <p>
                    پس از ایجاد store، استفاده از آن در یک کامپوننت ساده است.
                    در اینجا نحوه ادغام <code>useCounterStore</code> در یک کامپوننت React را می‌بینید:
                </p>
                <SyntaxHighlighter language="tsx">
                    {`import useCounterStore from './path/to/store'
    
    const Counter = () => {
        const { count, increaseCount, decreaseCount } = useCounterStore()
    
        return (
            <div>
                <h1>شمارنده: {count}</h1>
                <button onClick={increaseCount}>افزایش</button>
                <button onClick={decreaseCount}>کاهش</button>
            </div>
        )
    }
    
    export default Counter`}
                </SyntaxHighlighter>
                <p>
                    در این کامپوننت، ما از hook <code>useCounterStore</code> برای دسترسی به
                    وضعیت <code>count</code> و دو اکشن استفاده می‌کنیم. UI به‌طور خودکار
                    هر بار که وضعیت تغییر می‌کند به‌روز می‌شود و دکمه‌ها به کاربر این
                    امکان را می‌دهند که با وضعیت تعامل کند.
                </p>
            </div>
            <p>
                این فقط یک مثال ساده برای شروع کار با Zustand است. Zustand انعطاف‌پذیر است
                و می‌توان از آن برای سناریوهای پیچیده‌تر مدیریت وضعیت به‌ویژه زمانی که
                برنامه شما گسترش پیدا می‌کند استفاده کرد. اگر می‌خواهید استفاده‌های پیشرفته‌تر را بررسی کنید،
                پیشنهاد می‌کنیم مستندات رسمی{' '}
                <a
                    href="https://zustand.docs.pmnd.rs/getting-started/introduction"
                    target="_blank"
                    rel="noreferrer"
                >
                    Zustand
                </a>
                را مطالعه کنید.
            </p>
        </>
    )
}

export default StateManagement
