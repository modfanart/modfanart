const Text = () => {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                    پیش‌فرض (Default)
                </span>
                <p>روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد.</p>
            </div>
            <div>
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                    ایتالیک (Italic)
                </span>
                <p className="italic">
                    روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد.
                </p>
            </div>
            <div>
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                    زیرخط (Underline)
                </span>
                <p className="underline">
                    روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد.
                </p>
            </div>
            <div>
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                    بالای خط (Overline)
                </span>
                <p className="overline">
                    روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد.
                </p>
            </div>
            <div>
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                    خط‌خورده (Line-through)
                </span>
                <p className="line-through">
                    روباه قهوه‌ای سریع از روی سگ تنبل می‌پرد.
                </p>
            </div>
        </div>
    )
}

export default Text
