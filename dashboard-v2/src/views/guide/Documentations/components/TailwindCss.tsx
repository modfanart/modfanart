import Alert from '@/components/ui/Alert'
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const TailwindCss = () => {
    return (
        <>
            <p>
                Tailwind CSS یک فریم‌ورک CSS مبتنی بر ابزار است که کلاس‌های از پیش تعریف‌شده‌ای برای ساخت و طراحی UI به طور مستقیم در JSX فراهم می‌کند.
                Ecme از Tailwind به عنوان فریم‌ورک اصلی CSS خود استفاده می‌کند و بیشتر اجزای UI کاملاً با استفاده از ویژگی‌های آن ساخته شده‌اند.
                شما می‌توانید به راحتی با تغییر فایل{' '}
                <code>tailwind.config.cjs</code> که در دایرکتوری ریشه قرار دارد، تم و استایل‌های پایه را بروزرسانی کنید.
            </p>
            <div className="mt-10" id="tooling">
                <h5>ابزارها</h5>
                <p className="mt-1">
                    اگر از VS Code به عنوان IDE خود استفاده می‌کنید، توصیه می‌کنیم افزونه{' '}
                    <a
                        href="https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss"
                        rel="noreferrer"
                        target="_blank"
                    >
                        Tailwind CSS IntelliSense
                    </a>{' '}
                    را نصب کنید. این افزونه تکمیل خودکار، هایلایت سینتاکس و linting را بر اساس پیکربندی Tailwind شما فراهم می‌کند که می‌تواند سرعت فرآیند توسعه شما را به طور قابل توجهی افزایش دهد.
                </p>
            </div>
            <div className="mt-10" id="note">
                <Alert showIcon type="info" title="توجه داشته باشید">
                    برخی از اجزای UI ما از کلاس‌های معنایی با دستور <code>@apply</code> استفاده می‌کنند.
                    در برخی موارد، اعمال کلاس‌های Tailwind مستقیماً بر روی این اجزا ممکن است به طور مورد انتظار کار نکند.
                    شما ممکن است نیاز داشته باشید از ویرایشگر <code>!important</code> برای لغو انتخاب‌گرهای پیش‌فرض با دقت بالا استفاده کنید.
                </Alert>
            </div>
            <p>
                برای مهم کردن هر کلاس ابزاری، کافیست یک کاراکتر{' '}
                <code>!</code> را در ابتدای آن اضافه کنید، به عنوان مثال:
            </p>
            <SyntaxHighlighter language="jsx">{`<Dropdown className="!bg-red-500" />`}</SyntaxHighlighter>
            <p>
                برای اطلاعات بیشتر در مورد کلاس‌های ابزاری و پیکربندی Tailwind، مستندات رسمی را مشاهده کنید:{' '}
                <a
                    href="https://tailwindcss.com/docs/utility-first"
                    rel="noreferrer"
                    target="_blank"
                >
                    https://tailwindcss.com/docs/utility-first
                </a>
            </p>
        </>
    )
}

export default TailwindCss
