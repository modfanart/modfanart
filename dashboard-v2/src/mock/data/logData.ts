export const customerActivityLog = [
    {
        id: '1',
        date: 1746554397,
        events: [
            {
                type: 'TICKET-IN-PROGRESS',
                dateTime: 1746356928,
                description:
                    'تیم پشتیبانی در حال کار بر روی تیکت پشتیبانی شماره 123456',
            },
        ],
    },
    {
        id: '2',
        date: 1746450000,
        events: [
            {
                type: 'TICKET-IN-PROGRESS',
                dateTime: 1746459376,
                description:
                    'تیم پشتیبانی در حال کار بر روی تیکت پشتیبانی شماره 123456',
            },
            {
                type: 'SUPPORT-TICKET',
                dateTime: 1746458211,
                description: 'تیکت پشتیبانی شماره 113467 باز شد',
            },
        ],
    },
    {
        id: '3',
        date: 1746350000,
        events: [
            {
                dateTime: 1746580000,
                type: 'PAYMENT',
                description: 'پرداخت موفق برای سفارش انجام شد',
            },
            {
                type: 'PRODUCT-UPDATE',
                dateTime: 1746578417,
                description: 'تغییر به پلن پرو Acme به صورت سالانه',
            },
            {
                dateTime: 1746574027,
                type: 'PRODUCT-VIEW',
                description: 'مشاهده صفحه اشتراک',
            },
        ],
    },
]


export const logData = [
    {
        id: '1',
        date: 1646554397,
        events: [
            {
                type: 'UPDATE-TICKET',
                dateTime: 1646580000,
                ticket: 'PD-979',
                status: 0,
                userName: 'Angelina Gotelli',
                userImg: '',
            },
            {
                type: 'COMMENT',
                dateTime: 1646578417,
                userName: 'Max Alexander',
                userImg: '/img/avatars/thumb-3.jpg',
                comment: `نظر: «خوب، جاوا ممکن است نمونه خوبی از زبان برنامه نویسی باشد. اما برنامه‌های جاوا نمونه‌های خوبی از این هستند که برنامه‌ها نباید چگونه باشند.`,
            },
            {
                type: 'ADD-TAGS-TO-TICKET',
                dateTime: 1646574027,
                userName: 'Eugene Stewart',
                tags: ['نسخه زنده', 'بک اند']
            },
            {
                type: 'ADD-FILES-TO-TICKET',
                dateTime: 1646569123,
                userName: 'Shannon Baker',
                files: ['document.csv'],
                ticket: 'PD-1092',
            },
            {
                type: 'COMMENT-MENTION',
                dateTime: 1646565473,
                userName: 'Roberta Horton',
                userImg: '/img/avatars/thumb-7.jpg',
                comment: `<strong>@کارولین</strong> یکی از دلایل اصلی سقوط امپراتوری روم این بود که - به دلیل نداشتن عدد صفر - راهی برای نشان دادن پایان موفقیت‌آمیز برنامه‌های C خود نداشتند.`
            },
            {
                type: 'ASSIGN-TICKET',
                dateTime: 1646554397,
                userName: 'Lee Wheeler',
                assignee: 'Alvin Moreno',
                ticket: 'PD-1092',
            },
        ],
    },
    {
        id: '2',
        date: 1646450000,
        events: [
            {
                type: 'COMMENT',
                dateTime: 1646459376,
                userName: 'Jessica Wells',
                userImg: '/img/avatars/thumb-8.jpg',
                comment: `مشکل برنامه‌نویس‌ها این است که تا زمانی که خیلی دیر نشده، نمی‌توانید بفهمید یک برنامه‌نویس چه کاری انجام می‌دهد.`
            },
            {
                type: 'UPDATE-TICKET',
                dateTime: 1646458211,
                ticket: 'PD-977',
                status: 1,
                userName: 'Earl Miles',
                userImg: '/img/avatars/thumb-10.jpg',
            },
            {
                type: 'CREATE-TICKET',
                dateTime: 1646457743,
                ticket: 'PD-977',
                userName: 'Arlene Pierce',
            },
            {
                type: 'ADD-TAGS-TO-TICKET',
                dateTime: 1646456743,
                userName: 'Terrance Moreno',
                tags: ['اشکال'],
            },
            {
                type: 'UPDATE-TICKET',
                dateTime: 1646455743,
                ticket: 'PD-902',
                status: 2,
                userName: 'Jackie Soto',
            },
        ],
    },
    {
        id: '3',
        date: 1646350000,
        events: [
            {
                type: 'UPDATE-TICKET',
                dateTime: 1646356928,
                ticket: 'PD-915',
                status: 0,
                userName: 'Alvin Moreno',
                userImg: '/img/avatars/thumb-14.jpg',
            },
            {
                type: 'COMMENT-MENTION',
                dateTime: 1646356103,
                userName: 'Roberta Horton',
                userImg: '/img/avatars/thumb-7.jpg',
                comment: `<strong>@کارولین</strong> اول مسئله را حل کن، بعد کد بنویس.`
            },
            {
                type: 'ADD-FILES-TO-TICKET',
                dateTime: 1646354001,
                userName: 'Shannon Baker',
                files: ['issue-1.jpg', 'issue-2.jpg'],
                ticket: 'PD-1011',
            },
            {
                type: 'CREATE-TICKET',
                dateTime: 1646353299,
                ticket: 'PD-983',
                userName: 'Eugene Stewart',
            },
            {
                type: 'COMMENT',
                dateTime: 1646351233,
                userName: 'Shannon Baker',
                userImg: '/img/avatars/thumb-4.jpg',
                comment: `اخیراً متوجه شده‌ام که ترس پارانویایی از هوشمند شدن کامپیوترها و تسلط آن‌ها بر دنیا تقریباً به‌طور کامل از فرهنگ عمومی ناپدید شده است. تا جایی که می‌توانم بگویم، این همزمان با انتشار MS-DOS اتفاق افتاد.`
            },
        ],
    },
    {
        id: '4',
        date: 1646250000,
        events: [
            {
                type: 'UPDATE-TICKET',
                dateTime: 1646259999,
                ticket: 'PD-911',
                status: 1,
                userName: 'Terrance Moreno',
                userImg: '/img/avatars/thumb-2.jpg',
            },
            {
                type: 'ADD-TAGS-TO-TICKET',
                dateTime: 1646258110,
                userName: 'Terrance Moreno',
                tags: ['اشکال'],
            },
            {
                type: 'CREATE-TICKET',
                dateTime: 1646258000,
                ticket: 'PD-911',
                userName: 'Terrance Moreno',
            },
            {
                type: 'COMMENT',
                dateTime: 1646253204,
                userName: 'Camila Simmmons',
                userImg: '/img/avatars/thumb-9.jpg',
                comment: `به محض شروع برنامه نویسی، در کمال تعجب متوجه شدیم که درست کردن برنامه ها آنقدر که فکر می کردیم آسان نیست. اشکال زدایی باید کشف می شد. دقیقاً لحظه ای را به یاد می آورم که متوجه شدم بخش زیادی از زندگی من از آن زمان به بعد صرف یافتن اشتباهات در برنامه های خودم می شود.`,
            },
        ],
    },
    {
        id: '5',
        date: 1646150000,
        events: [
            {
                type: 'CREATE-TICKET',
                dateTime: 1646159652,
                ticket: 'PD-908',
                userName: 'Jackie Soto',
            },
            {
                type: 'CREATE-TICKET',
                dateTime: 1646159134,
                ticket: 'PD-907',
                userName: 'Jackie Soto',
            },
            {
                type: 'ADD-TAGS-TO-TICKET',
                dateTime: 1646253113,
                userName: 'Jackie Soto',
                tags: ['Bug'],
                ticket: 'PD-906',
            },
            {
                type: 'COMMENT-MENTION',
                dateTime: 1646252044,
                userName: 'Miriam Herrera',
                userImg: '/img/avatars/thumb-12.jpg',
                comment: `<strong>@Carolyn</strong> برنامه نویسان برای ایجاد برنامه های ضد احمق بزرگتر و بهتر در حال رقابت با جهان هستند، در حالی که جهان در تلاش است احمق های بزرگتر و بهتری ایجاد کند. تا اینجا کائنات برنده است.`,
            },
            {
                type: 'CREATE-TICKET',
                dateTime: 164625157,
                ticket: 'PD-906',
                userName: 'Jackie Soto',
            },
        ],
    },
    {
        id: '6',
        date: 1646050000,
        events: [
            {
                type: 'COMMENT-MENTION',
                dateTime: 1646051653,
                userName: 'Camila Simmmons',
                userImg: '/img/avatars/thumb-9.jpg',
                comment: `<strong>@Carolyn</strong> دو راه برای نوشتن برنامه‌های بدون خطا وجود دارد. فقط سومی کار میکنه`,
            },
            {
                type: 'ADD-FILES-TO-TICKET',
                dateTime: 1646050199,
                username: 'Angelina Gotelli',
                files: ['translation.xls'],
                ticket: 'PD-1092',
            },
            {
                type: 'COMMENT-MENTION',
                dateTime: 1646050001,
                username: 'Angelina Gotelli',
                userImg: '/img/avatars/thumb-1.jpg',
                comment: `<strong>@Carolyn</strong> اگر درست کار نکرد نگران نباشید. اگر همه چیز انجام می شد، شما بیکار می شدید.`,
            },
        ],
    },
    {
        id: '7',
        date: 1646490000,
        events: [
            {
                type: 'CREATE-TICKET',
                dateTime: 1646499327,
                ticket: 'PD-919',
                userName: 'Jackie Soto',
            },
            {
                type: 'COMMENT',
                dateTime: 1646497323,
                userName: 'Jessica Wells',
                userImg: '/img/avatars/thumb-8.jpg',
                comment: `دو روش برای ساخت یک طراحی نرم افزاری وجود دارد. یکی از راه ها این است که آن را به قدری ساده کنید که مشخصاً هیچ کمبودی وجود نداشته باشد. و راه دیگر این است که آن را آنقدر پیچیده کنیم که کمبودهای آشکاری وجود نداشته باشد.`,
            },
            {
                type: 'COMMENT-MENTION',
                dateTime: 1646492123,
                userName: 'Roberta Horton',
                userImg: '/img/avatars/thumb-7.jpg',
                comment: `<strong>@Carolyn</strong> این چیزی است که در کار با رایانه جالب است. آنها بحث نمی کنند، همه چیز را به یاد می آورند و تمام آبجو شما را نمی نوشند. (پل لیری) با توجه به وضعیت غم انگیز فعلی برنامه های رایانه ای ما، توسعه نرم افزار به وضوح هنوز یک هنر سیاه است و هنوز نمی توان آن را یک رشته مهندسی نامید.`,
            },
            {
                type: 'UPDATE-TICKET',
                dateTime: 1646491065,
                ticket: 'PD-915',
                status: 1,
                userName: 'Earl Miles',
                userImg: '/img/avatars/thumb-10.jpg',
            },
        ],
    },
]
