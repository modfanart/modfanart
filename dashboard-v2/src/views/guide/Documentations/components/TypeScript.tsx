/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const TypeScript = () => {
    return (
        <>
            <p>
                این راهنما شما را در تنظیمات TypeScript و استفاده از ویژگی‌های آن در Elsatr راهنمایی می‌کند. از آنجایی که Ecme به طور کامل با TypeScript توسعه داده شده است، این امکان را به شما می‌دهد که کد ایمن و مقیاس‌پذیر بنویسید و کار را برای ساخت برنامه‌های وب مدرن آسان‌تر می‌کند.
            </p>
            <div className="mt-10" id="ts-config">
                <h5>تنظیمات TypeScript</h5>
                <p>
                    پیکربندی صحیح در پروژه‌های TypeScript ضروری است زیرا به شما این امکان را می‌دهد که گزینه‌های مختلف کامپایلر را به گونه‌ای تنظیم کنید که نیازهای پروژه‌تان را برآورده کند. شما می‌توانید این تنظیمات را در فایل{' '}
                    <code>tsconfig.json</code> انجام دهید.
                </p>
            </div>
            <div className="mt-10" id="ts-config">
                <h5>تنظیمات سخت‌گیری TypeScript</h5>
                <p>
                    ما درک می‌کنیم که ممکن است همه با سخت‌گیری‌های چک کردن نوع در TypeScript راحت نباشند. اگر شما تجربه‌ای شبیه به جاوااسکریپت و کمتر سخت‌گیرانه می‌خواهید، می‌توانید تنظیمات را طوری تغییر دهید که چک کردن نوع ضعیف‌تر باشد.
                </p>
                <p>
                    در اینجا یک مثال از پیکربندی <code>tsconfig.json</code> برای چک کردن نوع ضعیف‌تر آمده است:
                </p>
                <SyntaxHighlighter language="json">{`{
  "compilerOptions": {
    "strict": false,
    ...
  }
}`}</SyntaxHighlighter>
                <p>
                    این پیکربندی سخت‌گیری TypeScript را کاهش می‌دهد و به شما انعطاف‌پذیری بیشتری می‌دهد و تجربه‌ای شبیه به جاوااسکریپت را فراهم می‌کند.
                </p>
            </div>
        </>

    )
}

export default TypeScript
