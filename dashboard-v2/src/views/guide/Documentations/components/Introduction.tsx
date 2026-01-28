/* eslint-disable react/no-unescaped-entities */
const coreFeatures = [
    {
        id: 'react',
        name: 'React',
        img: '/img/thumbs/react.png',
        src: 'https://reactjs.org/',
        description:
            'A popular JavaScript library for building user interfaces.',
    },
    {
        id: 'vite',
        name: 'Vite',
        img: '/img/thumbs/vite.png',
        src: 'https://vitejs.dev/',
        description:
            'TypeScript is a strongly typed programming language that builds on JavaScript',
    },
    {
        id: 'typeScript',
        name: 'TypeScript',
        img: '/img/thumbs/typeScript.png',
        src: 'https://www.typescriptlang.org/',
        description:
            'Vite is a modern, blazing-fast tool for scaffolding and bundling',
    },
    {
        id: 'tailwind',
        name: 'Tailwind Css',
        img: '/img/thumbs/tailwind.png',
        src: 'https://tailwindcss.com/',
        description: 'A utility-first CSS framework packed with classes.',
    },
]

const Introduction = () => {
    return (
        <>
            <div id="introduction" className="mb-8">
                <p>
                    اکمه تنها یک الگوی وب دیگر نیست—بلکه یک اثر هنری با دقت ساخته شده است که در بازاری پر از گزینه‌های عمومی و ضعیف طراحی شده برجسته می‌شود. هر جنبه از اکمه، از رابط کاربری شیک آن گرفته تا معماری کد قوی آن، به طور دقیق طراحی شده است تا انعطاف‌پذیری و مقیاس‌پذیری بی‌نظیری را برای پروژه‌های شما تضمین کند.
                </p>
                <p>
                    برخلاف سایر الگوهایی که به کتابخانه‌های متن باز رایج تکیه می‌کنند، اکمه مجموعه‌ای جامع از کامپوننت‌های رابط کاربری سفارشی ساخته شده دارد. این کامپوننت‌ها نه تنها از نظر عملکرد غنی هستند بلکه کنترل بیشتری را ارائه می‌دهند، به شما این امکان را می‌دهند که هر جزئیات را مطابق با نیازهای خاص خود تنظیم کنید.
                </p>
                <p>
                    اکمه مجهز به ویژگی‌های پیشرفته‌ای مانند پشتیبانی از چند زبان، حالت تاریک و روشن، چیدمان راست به چپ، سفارشی‌سازی رنگ تم و قابلیت جابجایی بی‌وقفه بین شش طرح‌بندی از پیش طراحی شده است. چه در حال ساخت یک پلتفرم جهانی باشید و چه یک برنامه خاص، انعطاف‌پذیری اکمه به شما کمک می‌کند.
                </p>
                <p>
                    علاوه بر این، مثال‌های برنامه‌ای گنجانده شده بر اساس موارد استفاده واقعی هستند و راه‌حل‌های عملی و آماده استفاده برای پروژه‌های شما ارائه می‌دهند. با اکمه، شما فقط یک الگو نمی‌خرید—بلکه در یک بنیان قدرتمند و انعطاف‌پذیر برای موفقیت در توسعه وب سرمایه‌گذاری می‌کنید.
                </p>
            </div>
            <div id="coreLibrary">
                <h4>کتابخانه‌های اصلی مورد استفاده</h4>
                <p>در اینجا فهرستی از کتابخانه‌های اصلی که در اکمه استفاده می‌کنیم آورده شده است</p>
                <div className="grid grid-cols-2 gap-4">
                    {coreFeatures.map((feat) => (
                        <a
                            key={feat.id}
                            className="border-2 border-gray-200 dark:border-gray-700 hover:border-primary flex flex-col items-center justify-center py-4 rounded-xl gap-2 no-underline"
                            href={feat.src}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img
                                className="max-h-16"
                                src={feat.img}
                                alt={feat.name}
                            />
                            <div className="text-center">
                                <div className="heading-text font-bold">
                                    {feat.name}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Introduction
