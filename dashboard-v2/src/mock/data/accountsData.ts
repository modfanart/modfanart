export const profileData = {
    id: '1',
    name: 'Angelina Gotelli',
    firstName: 'Angelina',
    lastName: 'Gotelli',
    email: 'carolyn_h@hotmail.com',
    img: '/img/avatars/thumb-1.jpg',
    location: 'New York, US',
    address: '123 Main St',
    postcode: '10001',
    city: 'New York',
    country: 'US',
    dialCode: '+1',
    birthday: '10/10/1992',
    phoneNumber: '+12-123-1234',
}

export const notificationSettingsData = {
    desktop: true,
    unreadMessageBadge: false,
    email: ['newsAndUpdate', 'tipsAndTutorial'],
    notifymeAbout: 'mentionsOnly',
}

export const billingSettingsData = {
    currentPlan: {
        plan: 'هیئت مدیره تجاری پایه',
        status: 'فعال',
        billingCycle: 'ماهانه',
        nextPaymentDate: 1739132800,
        amount: 59.9,
    },
    paymentMethods: [
        {
            cardId: '1',
            cardHolderName: 'Carolyn Perkins',
            cardType: 'VISA',
            expMonth: '12',
            expYear: '25',
            last4Number: '0392',
            primary: true,
        },
        {
            cardId: '2',
            cardHolderName: 'Carolyn Perkins',
            cardType: 'MASTER',
            expMonth: '06',
            expYear: '25',
            last4Number: '8461',
            primary: false,
        },
    ],
    transactionHistory: [
        {
            id: '#36223',
            item: 'پک پریمیوم آزمایشی',
            status: 'در انتظار',
            amount: 39.9,
            date: 1639132800,
        },
        {
            id: '#34283',
            item: 'اشتراک پایه تابلو کسب‌وکار',
            status: 'پرداخت شده',
            amount: 59.9,
            date: 1636790880,
        },
        {
            id: '#32234',
            item: 'اشتراک پایه تابلو کسب‌وکار',
            status: 'پرداخت شده',
            amount: 59.9,
            date: 1634090880,
        },
        {
            id: '#31354',
            item: 'اشتراک پایه تابلو کسب‌وکار',
            status: 'پرداخت شده',
            amount: 59.9,
            date: 1631532800,
        },
    ],
    
}

export const intergrationSettingData = [
    {
        id: '1',
        name: 'Google Drive',
        desc: 'فایل‌های خود را به گوگل درایو آپلود کنید',
        img: '/img/thumbs/google-drive.png',
        type: 'Cloud storage',
        active: true,
    },
    {
        id: '2',
        name: 'Slack',
        desc: 'در یک کانال اسلاک ارسال کنید',
        img: '/img/thumbs/slack.png',
        type: 'Notifications and events',
        active: true,
    },
    {
        id: '3',
        name: 'Notion',
        desc: 'یادداشت‌های نوشن را به پروژه خود بازیابی کنید',
        img: '/img/thumbs/notion.png',
        type: 'Content management',
        active: false,
    },
    {
        id: '4',
        name: 'Jira',
        desc: 'ایجاد مشکلات در جیرا',
        img: '/img/thumbs/jira.png',
        type: 'Project management',
        active: false,
    },
    {
        id: '5',
        name: 'Zendesk',
        desc: 'مبادله داده‌ها با زندسک',
        img: '/img/thumbs/zendesk.png',
        type: 'Customer service',
        active: false,
    },
    {
        id: '6',
        name: 'Dropbox',
        desc: 'مبادله داده‌ها با دراپ‌باکس',
        img: '/img/thumbs/dropbox.png',
        type: 'Cloud storage',
        active: false,
    },
    {
        id: '7',
        name: 'Github',
        desc: 'مبادله فایل‌ها با مخزن گیت‌هاب',
        img: '/img/thumbs/github.png',
        type: 'Code repositories',
        active: false,
    },
    {
        id: '8',
        name: 'Gitlab',
        desc: 'مبادله فایل‌ها با مخزن گیت‌لب',
        type: 'Code repositories',
        img: '/img/thumbs/gitlab.png',
        active: false,
    },
    {
        id: '9',
        name: 'Figma',
        desc: 'مبادله اسکرین‌شات‌ها با فیگما',
        img: '/img/thumbs/figma.png',
        type: 'Design tools',
        active: false,
    },
    {
        id: '10',
        name: 'Adobe XD',
        desc: 'مبادله اسکرین‌شات‌ها با Adobe XD',
        img: '/img/thumbs/adobe-xd.png',
        type: 'Design tools',
        active: false,
    },
    {
        id: '11',
        name: 'Sketch',
        desc: 'مبادله اسکرین‌شات‌ها با Sketch',
        img: '/img/thumbs/sketch.png',
        type: 'Design tools',
        active: false,
    },
    {
        id: '12',
        name: 'Hubspot',
        desc: 'مبادله داده‌ها با Hubspot',
        img: '/img/thumbs/hubspot.png',
        type: 'Content management',
        active: false,
    },
    {
        id: '13',
        name: 'Zapier',
        desc: 'ادغام با صدها سرویس مختلف',
        img: '/img/thumbs/zapier.png',
        type: 'Notifications and events',
        active: false,
    },
]

export const roleGroupsData = [
    {
        id: 'admin',
        name: 'مدیر',
        description:
            'دسترسی کامل به تمامی قابلیت‌ها و تنظیمات. امکان مدیریت کاربران، نقش‌ها و تنظیمات.',
        users: [],
        accessRight: {
            users: ['write', 'read', 'delete'],
            products: ['write', 'read', 'delete'],
            configurations: ['write', 'read', 'delete'],
            files: ['write', 'read', 'delete'],
            reports: ['write', 'read', 'delete'],
        },
    },
    {
        id: 'supervisor',
        name: 'سرپرست',
        description:
            'نظارت بر عملیات و کاربران. امکان مشاهده گزارش‌ها و دسترسی محدود به تنظیمات.',
        users: [],
        accessRight: {
            users: ['write', 'read'],
            products: ['write', 'read'],
            configurations: ['write', 'read'],
            files: ['write', 'read'],
            reports: ['read'],
        },
    },
    {
        id: 'support',
        name: 'پشتیبان',
        description:
            'ارائه کمک فنی. دسترسی به حساب‌های کاربری و گزارشات سیستم برای عیب‌یابی.',
        users: [],
        accessRight: {
            users: ['read'],
            products: ['write', 'read'],
            configurations: ['read'],
            files: ['write', 'read'],
            reports: ['read'],
        },
    },
    {
        id: 'user',
        name: 'کاربر',
        description:
            'دسترسی به ویژگی‌های پایه لازم برای انجام وظایف. محدودیت‌های مدیریتی.',
        users: [],
        accessRight: {
            users: [],
            products: ['read'],
            configurations: [],
            files: ['write', 'read'],
            reports: [],
        },
    },
    {
        id: 'auditor',
        name: 'حسابرس',
        description:
            'بررسی فعالیت‌های سیستم. دسترسی به گزارش‌ها، بدون امکان ایجاد تغییر.',
        users: [],
        accessRight: {
            users: ['read'],
            products: ['read'],
            configurations: [],
            files: ['read'],
            reports: ['read'],
        },
    },
    {
        id: 'guest',
        name: 'مهمان',
        description:
            'دسترسی موقت به ویژگی‌های محدود. مناسب برای بازدیدکنندگان یا کاربران موقت.',
        users: [],
        accessRight: {
            users: [],
            products: ['read'],
            configurations: [],
            files: [],
            reports: [],
        },
    },
]


export const pricingPlansData = {
    featuresModel: [
        {
            id: '',
            description: '',
        },
    ],
    plans: [
        {
            id: 'basic',
            name: 'پایه',
            description:
                'مناسب برای افراد یا تیم‌های کوچک. شامل ویژگی‌های ضروری مدیریت وظایف و پروژه‌ها.',
            price: {
                monthly: 59,
                annually: 500,
            },
            features: [
                'taskManagement',
                'managementTools',
                'reporting',
                'support',
            ],
            recommended: false,
        },
        {
            id: 'standard',
            name: 'استاندارد',
            description:
                'مناسب برای تیم‌های در حال رشد. ویژگی‌های پیشرفته برای افزایش بهره‌وری و همکاری بهتر.',
            price: {
                monthly: 79,
                annually: 700,
            },
            features: [
                'taskManagement',
                'managementTools',
                'reporting',
                'support',
                'fileSharing',
            ],
            recommended: false,
        },
        {
            id: 'pro',
            name: 'پرو',
            description:
                'مناسب برای تیم‌های بزرگ. شامل ویژگی‌های پیشرفته و پشتیبانی اختصاصی برای بهبود جریان کار.',
            price: {
                monthly: 129,
                annually: 1000,
            },
            features: [
                'taskManagement',
                'managementTools',
                'reporting',
                'support',
                'fileSharing',
                'advancedSecurity',
                'customIntegrations',
            ],
            recommended: true,
        },
    ],
    
}
