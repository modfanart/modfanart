const TextOverflow = () => {
    return (
        <div className="mx-auto max-w-sm p-8 border border-gray-200 dark:border-gray-600">
            <div className="mb-8">
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                (برش) Truncate 
                </span>
                <p className="truncate">
                    طولانی‌ترین کلمه در هر یک از دیکشنری‌های زبان انگلیسی اصلی عبارت است از
                    <span className="heading-text font-semibold">
                        pneumonoultramicroscopicsilicovolcanoconiosis,
                    </span>
                    کلمه‌ای که به بیماری ریه‌ای اشاره دارد که از استنشاق ذرات سیلیکا بسیار ریز، به‌ویژه از یک آتشفشان به‌وجود می‌آید؛ از نظر پزشکی، این همان بیماری سیلیکوز است.
                </p>
            </div>
            <div className="mb-8">
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                (حذف بخش‌ها) Ellipsis 
                </span>
                <p className="text-ellipsis overflow-hidden">
                    طولانی‌ترین کلمه در هر یک از دیکشنری‌های زبان انگلیسی اصلی عبارت است از
                    <span className="heading-text font-semibold">
                        pneumonoultramicroscopicsilicovolcanoconiosis,{' '}
                    </span>
                    کلمه‌ای که به بیماری ریه‌ای اشاره دارد که از استنشاق ذرات سیلیکا بسیار ریز، به‌ویژه از یک آتشفشان به‌وجود می‌آید؛ از نظر پزشکی، این همان بیماری سیلیکوز است.
                </p>
            </div>
            <div>
                <span className="text-sm text-slate-500 font-mono mb-3 dark:text-slate-400">
                (حذف بخش‌ها) Ellipsis 
                </span>
                <p className="text-clip overflow-hidden">
                    طولانی‌ترین کلمه در هر یک از دیکشنری‌های زبان انگلیسی اصلی عبارت است از
                    <span className="heading-text font-semibold">
                        pneumonoultramicroscopicsilicovolcanoconiosis,{' '}
                    </span>
                    کلمه‌ای که به بیماری ریه‌ای اشاره دارد که از استنشاق ذرات سیلیکا بسیار ریز، به‌ویژه از یک آتشفشان به‌وجود می‌آید؛ از نظر پزشکی، این همان بیماری سیلیکوز است.
                </p>
            </div>
        </div>
    )
}

export default TextOverflow
