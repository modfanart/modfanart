export const categoriesData = [
    {
        name: 'شروع به کار',
        topics: [
            {
                id: 'introduction',
                name: 'مقدمه',
                description:
                    'راهنمایی برای کاربران جدید جهت آشنایی با سیستم.',
                articleCounts: 4,
            },
            {
                id: 'setupGuide',
                name: 'راهنمای نصب',
                description:
                    'دستورالعمل‌های گام به گام برای نصب نرم‌افزار یا سیستم.',
                articleCounts: 6,
            },
            {
                id: 'basicFeatures',
                name: 'ویژگی‌های اصلی',
                description:
                    'معرفی ویژگی‌ها و قابلیت‌های پایه.',
                articleCounts: 3,
            },
        ],
    },    
    {
        name: 'جمع‌آوری و تحلیل داده‌ها',
        topics: [
            {
                id: 'survey',
                name: 'نظرسنجی',
                description:
                    'مقالات مرتبط با جمع‌آوری داده‌ها از طریق نظرسنجی‌ها.',
                articleCounts: 4,
            },
            {
                id: 'analytic',
                name: 'تحلیل',
                description: 'مقالات مرتبط با تحلیل داده‌ها.',
                articleCounts: 6,
            },
            {
                id: 'dataVisualization',
                name: 'تصویری‌سازی داده‌ها',
                description:
                    'مقالات مرتبط با نمایش داده‌ها در نمودارها و گراف‌ها و غیره.',
                articleCounts: 9,
            },
        ],
    },
    {
        name: 'مدیریت سیستم و امنیت',
        topics: [
            {
                id: 'chatbot',
                name: 'چت‌بات',
                description: 'مقالات مرتبط با ارتباط خودکار.',
                articleCounts: 8,
            },
            {
                id: 'media',
                name: 'رسانه',
                description: 'مقالات مرتبط با رسانه و محتوا.',
                articleCounts: 3,
            },
            {
                id: 'security',
                name: 'امنیت',
                description: 'مقالات مرتبط با تأمین امنیت.',
                articleCounts: 5,
            },
            {
                id: 'integration',
                name: 'یکپارچه‌سازی',
                description:
                    'مقالات مرتبط با یکپارچه‌سازی سیستم‌های مختلف.',
                articleCounts: 7,
            },
            {
                id: 'themes',
                name: 'قالب‌ها',
                description: 'مقالات مرتبط با قالب‌ها و سفارشی‌سازی.',
                articleCounts: 9,
            },
            {
                id: 'commission',
                name: 'کمیسیون',
                description: 'مقالات مرتبط با مدیریت کمیسیون‌ها.',
                articleCounts: 11,
            },
        ],
    },    
]

export const articleListData = [
    {
        id: 'pWBKE_0UiQ',
        title: 'چیزهایی که باید در مورد پیکربندی تم بدانید',
        content:
            'اندازه‌گیری پیشرفت برنامه‌نویسی بر اساس خطوط کد مانند اندازه‌گیری پیشرفت ساخت هواپیما بر اساس وزن است. شما نمی‌توانید نرم‌افزار عالی داشته باشید بدون تیم عالی، و بیشتر تیم‌های نرم‌افزاری مانند خانواده‌های دچار اختلال عمل می‌کنند.',
        category: 'themes',
        authors: [
            {
                name: 'ران وگاس',
                img: '/img/avatars/thumb-3.jpg',
            },
        ],
        tags: [
            { id: 2, label: 'پیاده‌سازی' },
            { id: 3, label: 'عیب‌یابی' },
        ],
        starred: true,
        published: true,
        updateTime: '2 هفته پیش',
        updateTimeStamp: 1717830464,
        createdBy: 'ران وگاس',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 42,
    },
    {
        id: '2tv0CboXfj',
        title: 'درک پیش‌زمینه تم‌ها',
        content:
            'یک هکر در حال پیشرفت ممکن است بتواند در مدت چند ماه چیزی تولید کند که یک گروه توسعه کوچک (مثلاً 7-8 نفر) در طول یک سال قادر به جمع‌آوری آن نباشند. IBM گزارش می‌داد که برخی برنامه‌نویسان ممکن است تا 100 برابر نسبت به دیگر کارکنان بهره‌ورتر باشند، یا بیشتر.',
        category: 'themes',
        authors: [
            {
                name: 'کارولین هنسن',
                img: '/img/avatars/thumb-9.jpg',
            },
            {
                name: 'سامانتا فیلیپس',
                img: '/img/avatars/thumb-6.jpg',
            },
        ],
        tags: [
            { id: 6, label: 'ادغام' },
            { id: 7, label: 'بهینه‌سازی' },
            { id: 8, label: 'امنیت' },
        ],
        starred: true,
        published: true,
        updateTime: '6 ماه پیش',
        updateTimeStamp: 1703488064,
        createdBy: 'کارولین هنسن',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 12,
    },
    {
        id: 'XHpEwVPi4D',
        title: 'ابزارهای پایه‌ای که باید در مورد پیکربندی تم بدانید',
        content:
            'این خنده‌دار است که 100 سال زندگی کنی و فقط قادر به یادآوری 30 میلیون بایت باشی. می‌دونی، کمتر از یک دیسک فشرده. وضعیت انسان واقعاً هر دقیقه بیشتر و بیشتر منسوخ می‌شود.',
        category: 'themes',
        authors: [
            {
                name: 'لوید اوبریان',
                img: '/img/avatars/thumb-11.jpg',
            },
        ],
        tags: [
            { id: 2, label: 'پیاده‌سازی' },
            { id: 3, label: 'عیب‌یابی' },
        ],
        starred: false,
        published: false,
        updateTime: '4 ماه پیش',
        updateTimeStamp: 1708672064,
        createdBy: 'لوید اوبریان',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 12,
    },
    
    {
        id: '09R6gIH5zD',
        title: 'راهنمایی ساده برای شما در زمینه تم‌سازی',
        content:
            'به محض شروع برنامه‌نویسی، با تعجب متوجه شدیم که به همان اندازه که فکر می‌کردیم، درست کردن برنامه‌ها آسان نیست. عیب‌یابی باید کشف می‌شد. من دقیقاً به خاطر می‌آورم که زمانی که متوجه شدم بخش بزرگی از زندگی من از آن به بعد قرار است صرف پیدا کردن اشتباهات در برنامه‌های خودم شود.',
        category: 'themes',
        authors: [
            {
                name: 'جویس فریمن',
                img: '/img/avatars/thumb-5.jpg',
            },
        ],
        tags: [
            { id: 9, label: 'استقرار' },
            { id: 10, label: 'نگهداری' },
            { id: 11, label: 'مقیاس‌پذیری' },
            { id: 12, label: 'عملکرد' },
            { id: 13, label: 'پشتیبان‌گیری' },
        ],
        starred: false,
        published: true,
        updateTime: '3 ماه پیش',
        updateTimeStamp: 1711264064,
        createdBy: 'جویس فریمن',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 53,
    },
    {
        id: 'rZjCbSyae5',
        title: 'چطور یک فرم نظرسنجی ایجاد کنیم',
        content:
            'وقتی به آن فکر می‌کنم، می‌بینم که میلیون‌ها میمون روی میلیون‌ها تایپ‌نویس نشسته‌اند و یوزنت هیچ شباهتی به شکسپیر ندارد.',
        category: 'survey',
        authors: [
            {
                name: 'ترنس مورنو',
                img: '/img/avatars/thumb-2.jpg',
            },
        ],
        tags: [
            { id: 14, label: 'نظارت' },
            { id: 15, label: 'اتوماسیون' },
            { id: 16, label: 'آزمایش' },
            { id: 17, label: 'مهاجرت' },
        ],
        starred: true,
        published: true,
        updateTime: '3 ماه پیش',
        updateTimeStamp: 1711264064,
        createdBy: 'ترنس مورنو',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 2,
    },
    {
        id: 'mmPo6vqS1t',
        title: 'بهترین شیوه‌های فرم نظرسنجی',
        content:
            'وقتی به آن فکر می‌کنم، می‌بینم که میلیون‌ها میمون روی میلیون‌ها تایپ‌نویس نشسته‌اند و یوزنت هیچ شباهتی به شکسپیر ندارد.',
        category: 'survey',
        authors: [
            {
                name: 'لوک کوک',
                img: '/img/avatars/thumb-4.jpg',
            },
            {
                name: 'سامانتا فیلیپس',
                img: '/img/avatars/thumb-6.jpg',
            },
            {
                name: 'جویس فریمن',
                img: '/img/avatars/thumb-5.jpg',
            },
        ],
        tags: [
            { id: 18, label: 'گزارش‌گیری' },
            { id: 19, label: 'بازیابی' },
        ],
        starred: false,
        published: false,
        updateTime: 'هفته گذشته',
        updateTimeStamp: 1718435264,
        createdBy: 'لوک کوک',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 4,
    },
    {
        id: '6ETEWm8ZHt',
        title: 'نکات ارزشمند برای کمک به شما در ایجاد سوال بهتر',
        content:
            'آموزش علوم کامپیوتر نمی‌تواند کسی را به برنامه‌نویس متخصص تبدیل کند به همان اندازه که مطالعه برس و رنگ‌ها نمی‌تواند کسی را به نقاش متخصص تبدیل کند. (اریک ری‌مون) اینترنت؟ آیا هنوز این چیز وجود دارد؟',
        category: 'survey',
        authors: [
            {
                name: 'جویس فریمن',
                img: '/img/avatars/thumb-5.jpg',
            },
        ],
        tags: [
            { id: 14, label: 'نظارت' },
            { id: 3, label: 'عیب‌یابی' },
            { id: 8, label: 'امنیت' },
        ],
        starred: false,
        published: false,
        updateTime: '2 ماه پیش',
        updateTimeStamp: 1713856064,
        createdBy: 'جویس فریمن',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },
    {
        id: 'WQCy5CZcEJ',
        title: 'نکات سریع در مورد امنیت',
        content:
            'به نظر می‌رسد که ما به محدودیت‌هایی از آنچه که با فناوری کامپیوتر امکان‌پذیر است رسیده‌ایم، اگرچه باید در مورد چنین بیانیه‌هایی محتاط بود، زیرا معمولاً در عرض 5 سال خیلی احمقانه به نظر می‌رسند.',
        category: 'security',
        authors: [
            {
                name: 'تارا فلتچر',
                img: '/img/avatars/thumb-7.jpg',
            },
        ],
        tags: [
            { id: 1, label: 'پیکربندی' },
            { id: 7, label: 'بهینه‌سازی' },
            { id: 10, label: 'نگهداری' },
        ],
        starred: false,
        published: true,
        updateTime: '4 ماه پیش',
        updateTimeStamp: 1708672064,
        createdBy: 'تارا فلتچر',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 1,
    },

    {
        id: 'prUH65MCWD',
        title: 'تمام چیزی که باید در مورد تنظیمات حریم خصوصی بدانید',
        content:
            'همانطور که شروع به برنامه‌نویسی کردیم، با تعجب متوجه شدیم که درست کردن برنامه‌ها به راحتی که فکر می‌کردیم نیست. دیباگ کردن باید کشف می‌شد. من دقیقا لحظه‌ای که فهمیدم بخش بزرگی از زندگی من از این به بعد صرف پیدا کردن اشتباهات در برنامه‌های خودم خواهد شد، به یاد دارم.',
        category: 'security',
        authors: [
            {
                name: 'تارا فلتچر',
                img: '/img/avatars/thumb-7.jpg',
            },
        ],
        tags: [
            { id: 4, label: 'سفارشی‌سازی' },
            { id: 11, label: 'مقیاس‌پذیری' },
            { id: 5, label: 'راه‌اندازی' },
            { id: 15, label: 'اتوماتیک‌سازی' },
        ],
        starred: false,
        published: false,
        updateTime: '۸ ماه پیش',
        updateTimeStamp: 1698304064,
        createdBy: 'تارا فلتچر',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 2,
    },
    {
        id: '1xK5PJRunm',
        title: 'راهنمای ساده برای یکپارچه‌سازی',
        content:
            'نرم‌افزار قبل از انتشار به آزمایش بتا می‌رود. بتا به لاتین یعنی "هنوز کار نمی‌کند". (نامشخص) حالا که به آن فکر می‌کنم، میلیون‌ها میمون روی میلیون‌ها ماشین تایپ هستند و Usenet هیچ شباهتی به شکسپیر ندارد. کد حذف‌شده کدی است که دیباگ شده.',
        category: 'integration',
        authors: [
            {
                name: 'فردریک آدامز',
                img: '/img/avatars/thumb-8.jpg',
            },
        ],
        tags: [
            { id: 3, label: 'عیب‌یابی' },
            { id: 8, label: 'امنیت' },
        ],
        starred: false,
        published: true,
        updateTime: '۷ ماه پیش',
        updateTimeStamp: 1700896064,
        createdBy: 'فردریک آدامز',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 3,
    },
    {
        id: 'iVB_L9xy2d',
        title: 'موثرترین راه‌ها برای غلبه بر مشکلات یکپارچه‌سازی.',
        content:
            'یک برنامه‌نویس فردی است که بر اساس توانایی تولید پاسخ‌های بی‌معنی و بی‌نظیر از فرضیات مبهم و اعداد قابل بحث، به عنوان یک متخصص دقیق شناخته می‌شود. این کارها بر روی ابزارهایی با دقت مشکوک و توسط افرادی با قابلیت‌های سوال‌برانگیز انجام می‌شود که هدف اصلی آنها آزار و اذیت دپارتمان بی‌دفاعی است که به اشتباه از آن اطلاعات خواسته است.',
        category: 'integration',
        authors: [
            {
                name: 'گابریلا می',
                img: '/img/avatars/thumb-12.jpg',
            },
            {
                name: 'گِیل بارنز',
                img: '/img/avatars/thumb-14.jpg',
            },
        ],
        tags: [
            { id: 2, label: 'پیاده‌سازی' },
            { id: 6, label: 'یکپارچه‌سازی' },
            { id: 12, label: 'عملکرد' },
            { id: 16, label: 'آزمایش' },
        ],
        starred: false,
        published: true,
        updateTime: '۳ روز پیش',
        updateTimeStamp: 1718780864,
        createdBy: 'گابریلا می',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 1,
    },
    {
        id: 't6D3gCV8hN',
        title: 'مستندات API برای یکپارچه‌سازی',
        content:
            'مدت زیادی من تعجب می‌کردم که چگونه چیزی به این گران‌قیمت و پیشرفته می‌تواند اینقدر بی‌فایده باشد. و بعد به ذهنم رسید که یک کامپیوتر یک ماشین احمق است که توانایی انجام کارهای فوق‌العاده هوشمندانه دارد، در حالی که برنامه‌نویسان کامپیوتر افراد هوشمندی هستند که توانایی انجام کارهای فوق‌العاده احمقانه دارند. آنها در کوتاه‌مدت، یک جفت عالی هستند.',
        category: 'integration',
        authors: [
            {
                name: 'الا رابینسون',
                img: '/img/avatars/thumb-15.jpg',
            },
        ],
        tags: [
            { id: 9, label: 'استقرار' },
            { id: 17, label: 'مهاجرت' },
            { id: 13, label: 'پشتیبان‌گیری' },
            { id: 18, label: 'گزارش‌گیری' },
            { id: 19, label: 'بازیابی' },
        ],
        starred: false,
        published: true,
        updateTime: '۲ هفته پیش',
        updateTimeStamp: 1717830464,
        createdBy: 'گابریلا می',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 31,
    },
    {
        id: 'gI3fhHZzoQ',
        title: 'بهترین شیوه‌ها برای یکپارچه‌سازی',
        content:
            'مایکروسافت نسخه جدیدی به نام ویندوز XP منتشر کرده است که طبق گفته همه، پایدارترین ویندوز تا به حال است. برای من، این مثل این است که بگوییم مارچوبه بهترین سبزی articulate است.',
        category: 'integration',
        authors: [
            {
                name: 'لی وییلر',
                img: '/img/avatars/thumb-13.jpg',
            },
        ],
        tags: [
            { id: 14, label: 'نظارت' },
            { id: 2, label: 'پیاده‌سازی' },
            { id: 5, label: 'راه‌اندازی' },
        ],
        starred: false,
        published: true,
        updateTime: '۳ هفته پیش',
        updateTimeStamp: 1717225664,
        createdBy: 'لی وییلر',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 7,
    },
    {
        id: '4zu-IVncIh',
        title: 'مدیریت ذخیره‌سازی رسانه‌ای',
        content:
            'کامپیوتر مرکزی شهر به شما گفته؟ R2D2، تو بهتر از این هستی که به یک کامپیوتر عجیب اعتماد کنی! (C3PO) 640K برای هر کسی کافی است.',
        category: 'media',
        authors: [
            {
                name: 'بریتانیا هیل',
                img: '/img/avatars/thumb-10.jpg',
            },
        ],
        tags: [
            { id: 11, label: 'مقیاس‌پذیری' },
            { id: 18, label: 'گزارش‌گیری' },
        ],
        starred: false,
        published: true,
        updateTime: '۱ سال پیش',
        updateTimeStamp: 1687504064,
        createdBy: 'بریتانیا هیل',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 9,
    },
    {
        id: '4zu-WQX60M9MDJ',
        title: 'مراقب اندازه‌های بزرگ باشید',
        content:
            'نرم‌افزار بی‌کیفیت یک نفر، شغل تمام‌وقت یک نفر دیگر است. (جسیکا گاستون) این یک چیز جالب در صنعت ماست: نه تنها از اشتباهات خود یاد نمی‌گیریم، بلکه از موفقیت‌هایمان هم یاد نمی‌گیریم.',
        category: 'media',
        authors: [
            {
                name: 'ترانس مورنو',
                img: '/img/avatars/thumb-2.jpg',
            },
            {
                name: 'بریتانیا هیل',
                img: '/img/avatars/thumb-10.jpg',
            },
        ],
        tags: [
            { id: 3, label: 'عیب‌یابی' },
            { id: 13, label: 'پشتیبان‌گیری' },
            { id: 7, label: 'بهینه‌سازی' },
            { id: 4, label: 'سفارشی‌سازی' },
        ],
        starred: false,
        published: true,
        updateTime: '۱ سال پیش',
        updateTimeStamp: 1687504064,
        createdBy: 'ترانس مورنو',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },

    {
        id: 'yHE5vZ4sow',
        title: 'چند روش مؤثر برای بهینه‌سازی فایل‌های رسانه‌ای',
        content:
            'همیشه کد بنویسید انگار کسی که قرار است کد شما را نگهداری کند یک روانی خشونت‌آمیز است که می‌داند کجا زندگی می‌کنید. به یاد بیاورید که در حال حاضر میلیون‌ها میمون در حال تایپ با میلیون‌ها تایپ‌نویس هستند و Usenet هیچ شباهتی به شکسپیر ندارد.',
        category: 'media',
        authors: [
            {
                name: 'رون وارگاس',
                img: '/img/avatars/thumb-3.jpg',
            },
        ],
        tags: [
            { id: 14, label: 'نظارت' },
            { id: 3, label: 'عیب‌یابی' },
            { id: 8, label: 'امنیت' },
        ],
        starred: false,
        published: false,
        updateTime: '9 ماه پیش',
        updateTimeStamp: 1695712064,
        createdBy: 'رون وارگاس',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },
    {
        id: 'CZZxidbzLi',
        title: 'جمع‌آوری داده‌ها به راحتی',
        content:
            'برنامه‌نویسی مثل سکس است: یک اشتباه و شما پشتیبانی برای تمام عمر را فراهم کرده‌اید. به نظر می‌رسد که به حد توان فناوری کامپیوتر رسیده‌ایم، اگرچه باید مراقب چنین بیانیه‌هایی بود، چون معمولاً در 5 سال آینده احمقانه به نظر می‌رسند.',
        category: 'analytic',
        authors: [
            {
                name: 'لوک کوک',
                img: '/img/avatars/thumb-4.jpg',
            },
        ],
        tags: [
            { id: 6, label: 'ادغام' },
            { id: 15, label: 'خودکارسازی' },
        ],
        starred: false,
        published: true,
        updateTime: '3 ماه پیش',
        updateTimeStamp: 1711264064,
        createdBy: 'لوک کوک',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },
    {
        id: 'aOuPn7DxZz',
        title: 'راهنمای ساده برای گزارش اسنپ‌شات',
        content:
            'اگر سازندگان ساختمان‌ها را همان‌طور که برنامه‌نویسان برنامه می‌نویسند می‌ساختند، اولین دارکوبی که می‌آمد، تمدن را نابود می‌کرد. فقط دو صنعت وجود دارند که مشتریان خود را کاربران می‌نامند.',
        category: 'analytic',
        authors: [
            {
                name: 'کارولین هنسون',
                img: '/img/avatars/thumb-9.jpg',
            },
        ],
        tags: [
            { id: 8, label: 'امنیت' },
            { id: 16, label: 'آزمایش' },
            { id: 1, label: 'پیکربندی' },
            { id: 19, label: 'بازیابی' },
            { id: 12, label: 'عملکرد' },
        ],
        starred: false,
        published: false,
        updateTime: '4 ماه پیش',
        updateTimeStamp: 1708672064,
        createdBy: 'کارولین هنسون',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },
    {
        id: '90hXaTVMr3',
        title: 'چند روش برای تولید گزارش مقایسه‌ای',
        content:
            'مشکل با برنامه‌نویسان این است که هیچ وقت نمی‌توانی بفهمی برنامه‌نویس چه کار می‌کند تا اینکه خیلی دیر بشود. بیشتر شما با ویژگی‌های برنامه‌نویس آشنا هستید. سه ویژگی وجود دارد: تنبلی، بی‌صبری و غرور. برای درک بازگشتی، ابتدا باید بازگشتی را درک کنید.',
        category: 'analytic',
        authors: [
            {
                name: 'کارولین پرکینز',
                img: '/img/avatars/thumb-1.jpg',
            },
        ],
        tags: [
            { id: 9, label: 'استقرار' },
            { id: 17, label: 'مهاجرت' },
            { id: 10, label: 'نگهداری' },
        ],
        starred: false,
        published: true,
        updateTime: '10 ماه پیش',
        updateTimeStamp: 1693120064,
        createdBy: 'آیلین هورتون',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },

    {
        id: 'bd3Hxes4NB',
        title: 'اضافه کردن سرویس مشتری جدید در چت‌بات',
        content:
            'به نظر می‌رسد که به محدودیت‌هایی رسیده‌ایم که فناوری کامپیوتر قادر به دستیابی به آنها است، هرچند باید مراقب چنین اظهار نظرهایی بود، زیرا این نظرات ممکن است در 5 سال آینده بسیار بی‌معنی به نظر برسند.',
        category: 'chatbot',
        authors: [
            {
                name: 'ترنس مورنو',
                img: '/img/avatars/thumb-2.jpg',
            },
        ],
        tags: [
            { id: 11, label: 'مقیاس‌پذیری' },
            { id: 2, label: 'پیاده‌سازی' },
            { id: 18, label: 'گزارش‌گیری' },
        ],
        starred: false,
        published: false,
        updateTime: '2 ماه پیش',
        updateTimeStamp: 1713856064,
        createdBy: 'ترنس مورنو',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },
    {
        id: 'zcZn3PBqKf',
        title: 'پیکربندی پاسخ خودکار',
        content:
            'وظیفه نرم‌افزار خوب این است که پیچیده‌ها را به شکلی ساده نشان دهد. اگر خودروها همان چرخه توسعه کامپیوتر را دنبال می‌کردند، امروز یک رولز رویس 100 دلار قیمت داشت، یک میلیون مایل در هر گالن می‌رفت و هر سال یک بار منفجر می‌شد و همه داخلش را می‌کشت.',
        category: 'chatbot',
        authors: [
            {
                name: 'فردریک آدامز',
                img: '/img/avatars/thumb-8.jpg',
            },
        ],
        tags: [
            { id: 1, label: 'پیکربندی' },
            { id: 9, label: 'استقرار' },
            { id: 15, label: 'اتوماتیک‌سازی' },
            { id: 5, label: 'راه‌اندازی' },
        ],
        starred: false,
        published: true,
        updateTime: '5 ماه پیش',
        updateTimeStamp: 1706080064,
        createdBy: 'فردریک آدامز',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 10,
    },
    {
        id: 'LWy8fEP-tA',
        title: 'محاسبه کمیسیون',
        content:
            'در نرم‌افزار، به ندرت خواسته‌های معنی‌داری داریم. حتی اگر داشته باشیم، تنها معیاری که مهم است این است که آیا راه‌حل ما مشکل مشتری که همیشه در حال تغییر است را حل می‌کند یا خیر. بهترین روش برای تسریع یک کامپیوتر، روشی است که آن را به میزان 9.8 متر بر ثانیه مربع تسریع کند.',
        category: 'commission',
        authors: [
            {
                name: 'لی ویلر',
                img: '/img/avatars/thumb-13.jpg',
            },
        ],
        tags: [
            { id: 14, label: 'نظارت' },
            { id: 3, label: 'عیب‌یابی' },
            { id: 8, label: 'امنیت' },
        ],
        starred: false,
        published: false,
        updateTime: '5 روز پیش',
        updateTimeStamp: 1718608064,
        createdBy: 'لی ویلر',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 12,
    },

    {
        id: 'SAxrgvMuip',
        title: 'صدور صورت‌حساب کمیسیون',
        content:
            'برای یک نفر، نرم‌افزار بد ممکن است شغل تمام‌وقت باشد. این موضوع جالبی در صنعت ما است: نه تنها از اشتباهات خود یاد نمی‌گیریم، بلکه از موفقیت‌هایمان نیز یاد نمی‌گیریم. اندازه‌گیری پیشرفت برنامه‌نویسی با تعداد خطوط کد مانند اندازه‌گیری پیشرفت ساخت هواپیما با وزن است.',
        category: 'commission',
        authors: [
            {
                name: 'Joyce Freeman',
                img: '/img/avatars/thumb-5.jpg',
            },
        ],
        tags: [{ id: 6, label: 'ادغام' }],
        starred: false,
        published: true,
        updateTime: 'یک سال پیش',
        updateTimeStamp: 1687504064,
        createdBy: 'Joyce Freeman',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 4,
    },
    {
        id: 'NcUFsNDmUV',
        title: 'سیاست کمیسیون',
        content:
            'باشه، جاوا ممکن است یک مثال خوب از آنچه که یک زبان برنامه‌نویسی باید باشد باشد. اما برنامه‌های جاوا مثال‌های خوبی از آنچه که نباید باشند هستند. (پیکسد) پنجاه سال تحقیق در زبان‌های برنامه‌نویسی و در نهایت با C++ روبرو می‌شویم؟',
        category: 'commission',
        authors: [
            {
                name: 'Carolyn Perkins',
                img: '/img/avatars/thumb-1.jpg',
            },
            {
                name: 'Gabriella May',
                img: '/img/avatars/thumb-12.jpg',
            },
        ],
        tags: [
            { id: 17, label: 'مهاجرت' },
            { id: 12, label: 'عملکرد' },
        ],
        starred: false,
        published: true,
        updateTime: 'یک سال پیش',
        updateTimeStamp: 1687504064,
        createdBy: 'Eileen Horton',
        timeToRead: 2,
        viewCount: 37,
        commentCount: 0,
    },
    {
        id: 'Dv1JsNEkWU',
        title: 'قدرت تجسم داده',
        content:
            'تجسم داده برای فهمیدن و قابل‌عمل کردن داده‌های پیچیده ضروری است. در این مقاله، تکنیک‌ها و ابزارهای مختلفی را برای تبدیل داده‌های خام به تصاویر بصری جذاب بررسی می‌کنیم.',
        category: 'dataVisualization',
        authors: [
            {
                name: 'Alex Johnson',
                img: '/img/avatars/thumb-2.jpg',
            },
            {
                name: 'Emily Zhang',
                img: '/img/avatars/thumb-5.jpg',
            },
        ],
        tags: [
            { id: 10, label: 'نگهداری' },
            { id: 7, label: 'بهینه‌سازی' },
        ],
        starred: false,
        published: true,
        updateTime: '3 ماه پیش',
        updateTimeStamp: 1711264064,
        createdBy: 'Michael Green',
        timeToRead: 5,
        viewCount: 85,
        commentCount: 0,
    },
    {
        id: 'Ks2DfNEmUZ',
        title: 'بهترین ابزارهای تجسم داده در سال 2024',
        content:
            'به‌روز بودن با بهترین ابزارهای تجسم داده برای هر تحلیلگر داده ضروری است. این مقاله بهترین ابزارهای موجود در سال 2024 را بررسی کرده و ویژگی‌ها و مزایای آنها را برجسته می‌کند.',
        category: 'dataVisualization',
        authors: [
            {
                name: 'Olivia Brown',
                img: '/img/avatars/thumb-3.jpg',
            },
        ],
        tags: [{ id: 3, label: 'عیب‌یابی' }],
        starred: false,
        published: false,
        updateTime: '1 ماه پیش',
        updateTimeStamp: 1716448064,
        createdBy: 'Ethan Lewis',
        timeToRead: 4,
        viewCount: 120,
        commentCount: 0,
    },
    {
        id: 'Ms3RtNPlUZ',
        title: 'ایجاد داشبوردهای تعاملی',
        content:
            'داشبوردهای تعاملی می‌توانند درک و تعامل داده‌ها را به طور قابل‌توجهی افزایش دهند. این راهنما شما را از طریق فرایند ایجاد داشبوردهای پویا و تعاملی با استفاده از ابزارهای محبوب هدایت می‌کند.',
        category: 'dataVisualization',
        authors: [
            {
                name: 'Sophia Martinez',
                img: '/img/avatars/thumb-4.jpg',
            },
            {
                name: 'James Lee',
                img: '/img/avatars/thumb-9.jpg',
            },
        ],
        tags: [
            { id: 6, label: 'ادغام' },
            { id: 13, label: 'پشتیبان‌گیری' },
            { id: 17, label: 'مهاجرت' },
            { id: 12, label: 'عملکرد' },
        ],
        starred: false,
        published: true,
        updateTime: '2 هفته پیش',
        updateTimeStamp: 1717830464,
        createdBy: 'Daniel Robinson',
        timeToRead: 7,
        viewCount: 95,
        commentCount: 54,
    },
    {
        id: 'Jh5VsNQlUZ',
        title: 'داستان‌گویی داده‌ها با تجسم',
        content:
            'داستان‌گویی داده‌ها ترکیب داده‌ها، تصاویر و روایت است تا داستان‌های جذاب را بیان کند. در این راهنمای جامع، یاد می‌گیرید که چگونه با استفاده از تکنیک‌های تجسم داده‌ها داستان‌های جذاب بسازید.',
        category: 'dataVisualization',
        authors: [
            {
                name: 'Isabella Clark',
                img: '/img/avatars/thumb-7.jpg',
            },
            {
                name: 'William Davis',
                img: '/img/avatars/thumb-10.jpg',
            },
        ],
        tags: [
            { id: 4, label: 'سفارشی‌سازی' },
            { id: 10, label: 'نگهداری' },
            { id: 7, label: 'بهینه‌سازی' },
            { id: 16, label: 'آزمون' },
            { id: 19, label: 'بازیابی' },
        ],
        starred: false,
        published: false,
        updateTime: '6 ماه پیش',
        updateTimeStamp: 1703488064,
        createdBy: 'Sophia Martinez',
        timeToRead: 8,
        viewCount: 110,
        commentCount: 67,
    },
    {
        id: 'Ia6XsNPtVW',
        title: 'به پلتفرم ما خوش آمدید',
        content:
            "این مقاله نمای کلی از پلتفرم ما ارائه می‌دهد و ویژگی‌ها و قابلیت‌های اصلی آن را برجسته می‌کند. این بهترین نقطه شروع برای کاربران جدید است.",
        category: 'introduction',
        authors: [
            {
                name: 'John Smith',
                img: '/img/avatars/thumb-8.jpg',
            },
            {
                name: 'Sarah Brown',
                img: '/img/avatars/thumb-11.jpg',
            },
        ],
        tags: [
            { id: 8, label: 'امنیت' },
            { id: 1, label: 'پیکربندی' },
            { id: 12, label: 'عملکرد' },
        ],
        starred: false,
        published: true,
        updateTime: '1 سال پیش',
        updateTimeStamp: 1687504064,
        createdBy: 'Rachel Green',
        timeToRead: 3,
        viewCount: 150,
        commentCount: 10,
    },

    {
        id: 'Bb7YsNQmUV',
        title: "راهنمای شروع: راهنمای مبتدی‌ها",
        content:
            "این راهنمای مبتدی‌ها به شما کمک می‌کند تا با پلتفرم ما شروع کنید. یاد بگیرید چگونه حساب کاربری خود را تنظیم کنید و از ویژگی‌های پایه استفاده کنید.",
        category: 'introduction',
        authors: [
            {
                name: 'مایکل جانسون',
                img: '/img/avatars/thumb-9.jpg',
            },
        ],
        tags: [{ id: 8, label: 'امنیت' }],
        starred: true,
        published: true,
        updateTime: '2 ماه پیش',
        updateTimeStamp: 1713856064,
        createdBy: 'دیوید پارکر',
        timeToRead: 5,
        viewCount: 200,
        commentCount: 43,
    },
    {
        id: 'Cc8ZsNRnWX',
        title: 'آشنایی با داشبورد',
        content:
            'این مقاله اجزای مختلف داشبورد را توضیح می‌دهد و به کاربران جدید کمک می‌کند تا به راحتی از ویژگی‌های آن استفاده کنند.',
        category: 'introduction',
        authors: [
            {
                name: 'اما دیویس',
                img: '/img/avatars/thumb-10.jpg',
            },
            {
                name: 'جیمز ویلسون',
                img: '/img/avatars/thumb-12.jpg',
            },
        ],
        tags: [
            { id: 16, label: 'آزمایش' },
            { id: 1, label: 'پیکربندی' },
        ],
        starred: false,
        published: true,
        updateTime: '6 ماه پیش',
        updateTimeStamp: 1703488064,
        createdBy: 'کریس مارتین',
        timeToRead: 4,
        viewCount: 175,
        commentCount: 10,
    },
    {
        id: 'Dd9AsNStXY',
        title: 'آشنایی با ویژگی‌های کلیدی',
        content:
            'در این معرفی مفصل، با ویژگی‌های کلیدی پلتفرم ما آشنا شوید. ما همه چیز را از ابزارهای پایه گرفته تا قابلیت‌های پیشرفته پوشش داده‌ایم.',
        category: 'introduction',
        authors: [
            {
                name: 'اولیویا تیلور',
                img: '/img/avatars/thumb-3.jpg',
            },
        ],
        tags: [
            { id: 2, label: 'پیاده‌سازی' },
            { id: 6, label: 'یکپارچگی' },
            { id: 12, label: 'عملکرد' },
        ],
        starred: false,
        published: true,
        updateTime: '4 ماه پیش',
        updateTimeStamp: 1708672064,
        createdBy: 'سوفیا کلارک',
        timeToRead: 6,
        viewCount: 220,
        commentCount: 10,
    },
    {
        id: 'Ee0BsNQuYZ',
        title: 'راهنمای آشنایی با کاربران جدید',
        content:
            'این راهنمای آشنایی به کمک کاربران جدید می‌آید تا سریعاً با پلتفرم ما آشنا شوند. این راهنما نکات و ترفندهای ضروری برای مبتدی‌ها را پوشش می‌دهد.',
        category: 'introduction',
        authors: [
            {
                name: 'ویلیام رابینسون',
                img: '/img/avatars/thumb-4.jpg',
            },
            {
                name: 'ایزابللا مارتینز',
                img: '/img/avatars/thumb-5.jpg',
            },
        ],
        tags: [
            { id: 4, label: 'سفارشی‌سازی' },
            { id: 11, label: 'قابلیت مقیاس‌پذیری' },
        ],
        starred: true,
        published: true,
        updateTime: '1 هفته پیش',
        updateTimeStamp: 1718435264,
        createdBy: 'اما دیویس',
        timeToRead: 7,
        viewCount: 300,
        commentCount: 21,
    },
    {
        id: 'Fg1WsNQuXY',
        title: 'راهنمای نصب گام به گام',
        content:
            'این راهنما فرایند نصب پلتفرم ما روی سیستم شما را به صورت گام به گام توضیح می‌دهد. شامل اسکرین‌شات‌ها و نکات رفع اشکال است تا نصب به راحتی انجام شود.',
        category: 'setupGuide',
        authors: [
            {
                name: 'جان دو',
                img: '/img/avatars/thumb-1.jpg',
            },
        ],
        tags: [
            { id: 5, label: 'راه‌اندازی' },
            { id: 15, label: 'اتوماسیون' },
        ],
        starred: true,
        published: true,
        updateTime: '2 هفته پیش',
        updateTimeStamp: 1717830464,
        createdBy: 'جین اسمیت',
        timeToRead: 10,
        viewCount: 250,
        commentCount: 30,
    },
    {
        id: 'Gh2XsNPvYZ',
        title: 'تنظیمات پیکربندی اولیه',
        content:
            'یاد بگیرید چگونه تنظیمات اولیه پلتفرم ما را پیکربندی کنید. این مقاله تنظیمات ضروری را برای شروع سریع و کارآمد پوشش می‌دهد.',
        category: 'setupGuide',
        authors: [
            {
                name: 'امیلی واتسون',
                img: '/img/avatars/thumb-2.jpg',
            },
            {
                name: 'مارک جانسون',
                img: '/img/avatars/thumb-3.jpg',
            },
        ],
        tags: [{ id: 9, label: 'استقرار' }],
        starred: false,
        published: false,
        updateTime: '1 ماه پیش',
        updateTimeStamp: 1716448064,
        createdBy: 'کریس ایوانز',
        timeToRead: 8,
        viewCount: 180,
        commentCount: 22,
    },
    {
        id: 'Ij3YsNQwXZ',
        title: 'راه‌اندازی و پیکربندی شبکه',
        content:
            'این راهنما به شما کمک می‌کند تنظیمات شبکه مورد نیاز برای پلتفرم ما را راه‌اندازی و پیکربندی کنید. شامل دستورالعمل‌های دقیق و بهترین شیوه‌ها برای بهینه‌سازی شبکه است.',
        category: 'setupGuide',
        authors: [
            {
                name: 'اولیویا براون',
                img: '/img/avatars/thumb-4.jpg',
            },
        ],
        tags: [
            { id: 18, label: 'ثبت‌گذاری' },
            { id: 19, label: 'بازیابی' },
        ],
        starred: true,
        published: true,
        updateTime: '3 ماه پیش',
        updateTimeStamp: 1711264064,
        createdBy: 'لیام وایت',
        timeToRead: 12,
        viewCount: 220,
        commentCount: 18,
    },
    {
        id: 'Kl4ZsNQtYZ',
        title: 'راه‌اندازی حساب کاربری',
        content:
            'این مقاله راهنمای جامع برای راه‌اندازی حساب‌های کاربری در پلتفرم ما است. این مقاله شامل ایجاد حساب، تخصیص نقش‌ها و تنظیمات دسترسی است.',
        category: 'setupGuide',
        authors: [
            {
                name: 'سوفیا لی',
                img: '/img/avatars/thumb-5.jpg',
            },
            {
                name: 'جیمز ویلسون',
                img: '/img/avatars/thumb-6.jpg',
            },
        ],
        tags: [{ id: 13, label: 'پشتیبان‌گیری' }],
        starred: false,
        published: false,
        updateTime: '5 ماه پیش',
        updateTimeStamp: 1706080064,
        createdBy: 'اما دیویس',
        timeToRead: 9,
        viewCount: 200,
        commentCount: 25,
    },
    {
        id: 'Lm5WsNQuXY',
        title: 'مسیریابی در داشبورد',
        content:
            'این مقاله توضیح می‌دهد که چگونه می‌توانید در داشبورد اصلی پلتفرم ما مسیریابی کنید. با بخش‌های مختلف آشنا شوید و یاد بگیرید چگونه به راحتی به ویژگی‌های کلیدی دسترسی پیدا کنید.',
        category: 'basicFeatures',
        authors: [
            {
                name: 'آلیس جانسون',
                img: '/img/avatars/thumb-1.jpg',
            },
        ],
        tags: [{ id: 17, label: 'مهاجرت' }],
        starred: false,
        published: true,
        updateTime: '3 هفته پیش',
        updateTimeStamp: 1717225664,
        createdBy: 'دیوید لی',
        timeToRead: 5,
        viewCount: 389,
        commentCount: 14,
    },
    {
        id: 'No6XsNPrYZ',
        title: 'استفاده از عملکرد جستجو',
        content:
            'یاد بگیرید چگونه از عملکرد جستجوی قدرتمند پلتفرم ما برای یافتن اطلاعات مورد نیاز خود به سرعت و به طور کارآمد استفاده کنید. این راهنما تکنیک‌های جستجوی پایه و پیشرفته را پوشش می‌دهد.',
        category: 'basicFeatures',
        authors: [
            {
                name: 'مایکل براون',
                img: '/img/avatars/thumb-2.jpg',
            },
            {
                name: 'لاورا وایت',
                img: '/img/avatars/thumb-3.jpg',
            },
        ],
        tags: [{ id: 9, label: 'استقرار' }],
        starred: true,
        published: true,
        updateTime: '1 ماه پیش',
        updateTimeStamp: 1716448064,
        createdBy: 'سامانتا گرین',
        timeToRead: 4,
        viewCount: 457,
        commentCount: 19,
    },
    {
        id: 'Op7YsNRqXZ',
        title: 'سفارشی‌سازی پروفایل شما',
        content:
            'این راهنما شما را در فرآیند سفارشی‌سازی پروفایل‌تان هدایت می‌کند. یاد بگیرید چگونه اطلاعات شخصی خود را به‌روزرسانی کنید، آواتار خود را تغییر دهید و تنظیمات خود را تعیین کنید.',
        category: 'basicFeatures',
        authors: [
            {
                name: 'امیلی دیویس',
                img: '/img/avatars/thumb-4.jpg',
            },
        ],
        tags: [
            { id: 2, label: 'پیاده‌سازی' },
            { id: 5, label: 'راه‌اندازی' },
        ],
        starred: false,
        published: true,
        updateTime: '2 ماه پیش',
        updateTimeStamp: 1713856064,
        createdBy: 'جان اسمیت',
        timeToRead: 6,
        viewCount: 498,
        commentCount: 23,
    },
    {
        id: 'Qq8ZsNQtYZ',
        title: 'ویژگی‌های گزارش‌گیری پایه',
        content:
            'ویژگی‌های گزارش‌گیری پایه موجود در پلتفرم ما را کشف کنید. این مقاله توضیح می‌دهد چگونه گزارش‌ها را تولید، مشاهده و صادر کنید تا از داده‌های خود بینش به دست آورید.',
        category: 'basicFeatures',
        authors: [
            {
                name: 'سوفیا لی',
                img: '/img/avatars/thumb-5.jpg',
            },
            {
                name: 'جیمز ویلسون',
                img: '/img/avatars/thumb-6.jpg',
            },
        ],
        tags: [{ id: 5, label: 'راه‌اندازی' }],
        starred: false,
        published: false,
        updateTime: '5 ماه پیش',
        updateTimeStamp: 1706080064,
        createdBy: 'اما دیویس',
        timeToRead: 7,
        viewCount: 512,
        commentCount: 27,
    }
    ,
]
export const articleDetailData = {
    content: `
    <p>فناوری با سرعت بی‌سابقه‌ای در حال پیشرفت است و هر جنبه‌ای از زندگی ما را متحول می‌کند. از هوش مصنوعی تا محاسبات کوانتومی، پیشرفت‌های فناوری امکانات جدیدی را باز می‌کند و صنایع را در سراسر جهان دوباره شکل می‌دهد.</p>
    <div id="artificialIntelligence">
        <h5>هوش مصنوعی</h5><p>هوش مصنوعی (AI) یکی از مهم‌ترین پیشرفت‌های فناوری در عصر ما است. AI در بخش‌های مختلفی مانند مراقبت‌های بهداشتی، مالی و حمل و نقل یکپارچه شده و راه‌حل‌های نوآورانه‌ای برای مسائل پیچیده ارائه می‌دهد. انتظار می‌رود که AI در آینده صنایع را با بهبود کارایی، دقت و فرآیندهای تصمیم‌گیری متحول کند.</p><p>در حوزه سلامت، AI برای توسعه برنامه‌های درمانی شخصی، بهبود دقت تشخیص و ارتقای مراقبت‌های بیماران به کار می‌رود. به عنوان مثال، الگوریتم‌های AI می‌توانند حجم زیادی از داده‌های پزشکی را تحلیل کنند تا الگوها را شناسایی کرده و شیوع بیماری‌ها را پیش‌بینی کنند. در امور مالی، AI با استفاده از تحلیل داده‌های پیشرفته و سیستم‌های خودکار، استراتژی‌های معاملاتی، مدیریت ریسک و خدمات مشتری را متحول می‌کند.</p> </div>
    <div id="quantumComputing">
        <h5>محاسبات کوانتومی</h5><p>محاسبات کوانتومی یک فناوری تحول‌آفرین دیگر است که ظرفیت حل مسائلی را دارد که با رایانه‌های کلاسیک غیرقابل حل هستند. با توانایی انجام محاسبات پیچیده با سرعت‌های بی‌سابقه، رایانه‌های کوانتومی می‌توانند حوزه‌هایی مانند رمزنگاری، علم مواد و داروسازی را متحول کنند.</p><p>محققان هم‌اکنون در حال بررسی استفاده از محاسبات کوانتومی برای طراحی مواد جدید با ویژگی‌های خاص، بهینه‌سازی زنجیره‌های تأمین و توسعه درمان‌های دارویی جدید هستند. قدرت محاسباتی عظیم رایانه‌های کوانتومی می‌تواند یادگیری ماشین را نیز متحول کرده و به سیستم‌های هوش مصنوعی پیشرفته‌تر و بینش‌های عمیق‌تر از داده‌ها منجر شود.</p>
    </div>
    <div id="internetOfThings">
    <h5>اینترنت اشیاء (IoT)</h5>
    <p>اینترنت اشیاء (IoT) دستگاه‌ها و سیستم‌ها را به شکلی بی‌سابقه متصل کرده و دنیایی به هم پیوسته‌تر ایجاد می‌کند. از خانه‌های هوشمند تا اتوماسیون صنعتی، IoT نحوه زندگی و کار ما را با ارائه داده‌ها و بینش‌های بلادرنگ ارتقا می‌دهد. با ادامه پیشرفت فناوری IoT، انتظار می‌رود که برنامه‌های نوآورانه و کارایی‌های بیشتری را به ارمغان بیاورد.</p><p>شهرهای هوشمند در نتیجه IoT پدیدار شده‌اند، جایی که سیستم‌های متصل مدیریت همه چیز از جریان ترافیک تا مصرف انرژی را به عهده دارند و کیفیت زندگی شهری را بهبود می‌بخشند. در کشاورزی، دستگاه‌های IoT شرایط خاک، الگوهای آب‌وهوایی و سلامت محصولات را پایش می‌کنند و به روش‌های کارآمدتر کشاورزی و افزایش بهره‌وری منجر می‌شوند.</p>
    </div>
    <div id="5gTechnology">
        <h5>فناوری 5G</h5><p>فناوری 5G قرار است نحوه ارتباطات و دسترسی به اطلاعات ما را متحول کند. با سرعت‌های بیشتر و تأخیر کمتر، 5G برنامه‌های جدیدی مانند خودروهای خودران، شهرهای هوشمند و راه‌حل‌های پیشرفته بهداشتی را ممکن می‌سازد. انتظار می‌رود پذیرش گسترده 5G باعث رشد اقتصادی و ایجاد فرصت‌های جدید در صنایع مختلف شود.</p><p>علاوه بر تقویت ارتباطات موبایل، 5G از رشد IoT با ارائه زیرساخت‌های لازم برای میلیون‌ها دستگاه متصل پشتیبانی خواهد کرد. این امر به توسعه برنامه‌های نوآورانه در بخش‌های مختلف از جمله جراحی از راه دور، ترجمه بلادرنگ و تجربه‌های واقعیت مجازی فراگیر منجر خواهد شد.</p>
    </div>
    <div id="blockchainTechnology">
    <h5>فناوری بلاک‌چین</h5><p>فناوری بلاک‌چین که در ابتدا به عنوان زیرساخت ارزهای دیجیتال مانند بیت‌کوین توسعه یافت، اکنون برای پتانسیل آن در تحول صنایع مختلف فراتر از امور مالی شناخته شده است. با ارائه روشی غیرمتمرکز و ایمن برای ثبت تراکنش‌ها، بلاک‌چین می‌تواند شفافیت، امنیت و کارایی را بهبود بخشد.</p><p>در مدیریت زنجیره تأمین، بلاک‌چین می‌تواند محصولات را از مبدأ تا تحویل پیگیری کند و اصالت را تضمین کرده و از تقلب جلوگیری کند. در حوزه سلامت، می‌تواند امنیت پرونده‌های بیماران را تضمین کرده و امکان به اشتراک‌گذاری داده‌ها را با حفظ حریم خصوصی فراهم کند. علاوه بر این، قراردادهای هوشمند که قراردادهای خوداجرا هستند و شرایط آن‌ها به‌طور مستقیم در کد نوشته شده است، می‌توانند قراردادهای پیچیده حقوقی و مالی را به صورت خودکار و کارآمدتر کنند.</p><p>پتانسیل بلاک‌چین به سیستم‌های رأی‌گیری نیز گسترش می‌یابد و می‌تواند شفافیت و جلوگیری از دستکاری را تضمین کرده و اعتماد در فرآیند انتخاباتی را افزایش دهد. با پیشرفت این فناوری، انتظار می‌رود که کاربردهای آن گسترش یابد و نوآوری و کارایی را در حوزه‌های گوناگون به همراه آورد.</p><p>با نگاهی به آینده، مشخص است که فناوری نقش کلیدی در شکل‌گیری جهان ما ایفا خواهد کرد. پیشرفت‌های AI، محاسبات کوانتومی، IoT، 5G و بلاک‌چین تنها آغاز راه هستند. پذیرش این فناوری‌ها و استفاده از پتانسیل آن‌ها برای پیشبرد نوآوری و پیشرفت در سال‌های آینده ضروری خواهد بود.</p>
    </div>`,
    tableOfContent: [
        {
            id: 'artificialIntelligence',
            label: 'هوش مصنوعی',
        },
        {
            id: 'quantumComputing',
            label: 'محاسبات کوانتومی',
        },
        {
            id: 'internetOfThings',
            label: 'اینترنت اشیاء (IoT)',
        },
        {
            id: '5gTechnology',
            label: 'فناوری 5G',
        },
        {
            id: 'blockchainTechnology',
            label: 'فناوری بلاک‌چین',
        },
    ],
}


export const articleTagsData = {
    tags: [
        { id: 1, label: 'Configuring' },
        { id: 4, label: 'Customization' },
        { id: 5, label: 'Setup' },
    ],
}
