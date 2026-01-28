/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Css = () => {
    return (
        <>
            <p>
                در حالی که ما عمدتاً از Tailwind CSS استفاده می‌کنیم، همچنین استایل‌های سفارشی اضافی به زبان CSS استاندارد نوشته‌ایم که در دایرکتوری{' '}
                <code>src/assets/styles/*</code> قرار دارند. چون Tailwind به برخی از ویژگی‌های پردازش CSS بستگی دارد، ما از PostCSS به عنوان پیش‌پردازنده استفاده می‌کنیم.
            </p>
            <p>در اینجا یک نمای کلی از ساختار پوشه‌های استایل ما آورده شده است:</p>
            <SyntaxHighlighter>
                {`├── styles                     
    |   ├── components               # استایل‌ها برای کامپوننت‌های پایه UI
    |   ├── docs                     # استایل‌ها برای کامپوننت‌های مستندات
    |   ├── tailwind                 # ورودی و استایل‌های پایه Tailwind
    |   ├── template                 # استایل‌ها برای کامپوننت‌های قالب
    |   └── index.css                # استایل اصلی ورودی CSS
    `}
            </SyntaxHighlighter>
            <p>
                هر پوشه داخل دایرکتوری <code>styles</code> یک فایل <code>index.css</code> دارد که تمامی فایل‌های CSS دیگر در همان پوشه را وارد می‌کند.
                در نهایت، تمام این فایل‌های <code>index.css</code> به استایل اصلی وارد می‌شوند.
            </p>
            <div className="mt-10" id="writingCss">
                <h5>CSS سفارشی</h5>
                <p className="mt-1">
                    اگر Tailwind تمامی نیازهای استایل‌دهی شما را پوشش نمی‌دهد، می‌توانید CSS سفارشی خود را در این پوشه اضافه کنید. توصیه می‌کنیم هنگام افزودن استایل‌های سفارشی، از توابع و دستورات Tailwind مانند{' '}
                    <code>@apply</code>، <code>@layer</code> و <code>theme()</code> استفاده کنید.
                </p>
                <p>
                    برای جزئیات بیشتر در مورد نحوه استفاده از این ویژگی‌ها، می‌توانید{' '}
                    <a
                        href="https://tailwindcss.com/docs/functions-and-directives"
                        target="_blank"
                        rel="noreferrer"
                    >
                        مستندات رسمی Tailwind
                    </a>
                    را بررسی کنید.
                </p>
            </div>
        </>
    )
}

export default Css
