/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Installation = () => {
    return (
        <>
            <h6>پیش‌نیازها</h6>
            <p>
                قبل از شروع کار با Ecme، مطمئن شوید که محیط توسعه شما ابزارهای زیر را نصب کرده است:
            </p>
            <div className="mt-6">
                <ul>
                    <li>
                        <a
                            href="https://nodejs.org"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Node.js
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://www.npmjs.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            npm
                        </a>
                    </li>
                </ul>
            </div>
            <div className="mt-8">
                <h6>نصب Ecme</h6>
                <p>
                    پس از استخراج فایل .zip دانلود شده، سه پوشه خواهید یافت:
                </p>
                <ul>
                    <li>
                        <strong>demo</strong>
                        <p className="mt-1">
                            این پوشه شامل دموی کامل پروژه است، که تمام مواردی که در پیش‌نمایش زنده مشاهده می‌کنید را شامل می‌شود.
                            این پوشه فقط برای مرجع است و{' '}
                            <strong className="heading-text">
                                <em>توصیه نمی‌شود</em>
                            </strong>{' '}
                            برای توسعه.
                        </p>
                    </li>
                    <li>
                        <strong>starter</strong>
                        <p className="mt-1">
                            پکیج استارتر تنظیمات پایه برای قالب را فراهم می‌کند. این جایی است که باید توسعه خود را شروع کنید، صفحات ایجاد کنید و کد خود را اضافه کنید.
                            توصیه می‌کنیم این پوشه را به فضای کاری خود کپی کنید.
                        </p>
                    </li>
                    <li>
                        <strong>documentation</strong>
                        <p className="mt-1">
                            این پوشه شامل فایل index.html است که به مستندات آنلاین هدایت می‌کند.
                        </p>
                    </li>
                </ul>
                <p>
                    پس از انتخاب بسته مورد نظر خود، به دایرکتوری ریشه پروژه (جایی که <code>package.json</code> قرار دارد) بروید و دستور زیر را در کنسول اجرا کنید:
                </p>
                <SyntaxHighlighter>npm install</SyntaxHighlighter>
                <p>
                    این دستور تمامی وابستگی‌های لازم را در دایرکتوری node_modules نصب می‌کند و شما می‌توانید توسعه خود را شروع کنید.
                </p>
            </div>
        </>
    )
}

export default Installation
