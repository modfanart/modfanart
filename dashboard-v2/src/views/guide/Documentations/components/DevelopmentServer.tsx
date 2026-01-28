import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const DevelopmentServer = () => {
    return (
        <>
            <p>
                پس از نصب تمام وابستگی‌ها، می‌توانید سرور توسعه را با اجرای دستور زیر در ترمینال خود راه‌اندازی کنید:
            </p>
            <SyntaxHighlighter>npm run dev</SyntaxHighlighter>
            <p>
                مرورگر خود را باز کنید و به{' '}
                <a
                    href="http://localhost:5173/"
                    target="_blank"
                    rel="noreferrer"
                >
                    http://localhost:5173/
                </a>{' '}
                بروید. برنامه به‌صورت خودکار هر بار که تغییراتی در فایل‌های منبع اعمال کنید، بازخوانی می‌شود.
            </p>
        </>
    )
}


export default DevelopmentServer
