import moment from 'jalali-moment';
import { taskBugFix } from './projectsData'

const currentDate = new Date();

export const eCommerceData = {
    statisticData: {
        totalProfit: {
            thisWeek: {
                value: 21827.13,
                growShrink: 11.4,
                comparePeriod: 'از هفته گذشته',
                chartData: {
                    series: [
                        {
                            name: 'فروش',
                            data: [24, 28, 21, 34, 30, 44, 25],
                        },
                    ],
                    date: ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یک‌شنبه'],
                },
            },
            thisMonth: {
                value: 82373.21,
                growShrink: 3.4,
                comparePeriod: 'از ماه گذشته',
                chartData: {
                    series: [
                        {
                            name: 'فروش',
                            data: [
                                242, 334, 297, 364, 342, 431, 368, 477, 398,
                                489, 364, 571,
                            ],
                        },
                    ],
                    date: [
                        '01 خرداد',
                        '02 خرداد',
                        '03 خرداد',
                        '04 خرداد',
                        '05 خرداد',
                        '06 خرداد',
                        '07 خرداد',
                        '08 خرداد',
                        '09 خرداد',
                        '10 خرداد',
                        '11 خرداد',
                        '12 خرداد',
                    ],
                },
            },
            thisYear: {
                value: 329489.21,
                growShrink: 5.1,
                comparePeriod: 'از ماه گذشته',
                chartData: {
                    series: [
                        {
                            name: 'فروش',
                            data: [
                                240, 255, 210, 275, 230, 280, 220, 340, 305,
                                350, 300, 420,
                            ],
                        },
                    ],
                    date: [
                        'فروردین',
                        'اردیبهشت',
                        'خرداد',
                        'تیر',
                        'مرداد',
                        'شهریور',
                        'مهر',
                        'آبان',
                        'آذر',
                        'دی',
                        'بهمن',
                        'اسفند',
                    ],
                },
            },
        },
        totalOrder: {
            thisWeek: {
                value: 1782,
                growShrink: 9.2,
                comparePeriod: 'from last week',
                chartData: {
                    series: [
                        {
                            name: 'سفارش‌ها',
                            data: [14, 18, 12, 24, 20, 27, 16],
                        },
                    ],
                    date: ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه', 'یکشنبه'],
                },                
            },
            thisMonth: {
                value: 7234,
                growShrink: -2.8,
                comparePeriod: 'از ماه گذشته',
                chartData: {
                    series: [
                        {
                            name: 'سفارشات',
                            data: [
                                124, 173, 156, 183, 171, 211, 188, 244, 202,
                                258, 192, 271,
                            ],
                        },
                    ],
                    date: [
                        '01 خرداد',
                        '02 خرداد',
                        '03 خرداد',
                        '04 خرداد',
                        '05 خرداد',
                        '06 خرداد',
                        '07 خرداد',
                        '08 خرداد',
                        '09 خرداد',
                        '10 خرداد',
                        '11 خرداد',
                        '12 خرداد',
                    ],
                },
            },
            thisYear: {
                value: 28349,
                growShrink: 2.4,
                comparePeriod: 'از سال گذشته',
                chartData: {
                    series: [
                        {
                            name: 'سفارشات',
                            data: [
                                110, 118, 97, 121, 110, 137, 115, 171, 146, 167,
                                145, 202,
                            ],
                        },
                    ],
                    date: [
                        'فروردین',
                        'اردیبهشت',
                        'خرداد',
                        'تیر',
                        'مرداد',
                        'شهریور',
                        'مهر',
                        'آبان',
                        'آذر',
                        'دی',
                        'بهمن',
                        'اسفند',
                    ],
                },
            },
        },
        totalImpression: {
            thisWeek: {
                value: 832718,
                growShrink: -5.1,
                comparePeriod: 'از هفته گذشته',
                chartData: {
                    series: [
                        {
                            name: 'تاثیرات',
                            data: [
                                10234, 12812, 11721, 14344, 12030, 15444, 13225,
                            ],
                        },
                    ],
                    date: ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه'],
                },
            },
            thisMonth: {
                value: 3123734,
                growShrink: 4.6,
                comparePeriod: 'از ماه گذشته',
                chartData: {
                    series: [
                        {
                            name: 'تاثیرات',
                            data: [
                                242124, 334097, 297364, 364342, 342431, 431368,
                                368477, 477398, 398489, 489364, 364571, 571664,
                            ],
                        },
                    ],
                    date: [
                        '۰۱ خرداد',
                        '۰۲ خرداد',
                        '۰۳ خرداد',
                        '۰۴ خرداد',
                        '۰۵ خرداد',
                        '۰۶ خرداد',
                        '۰۷ خرداد',
                        '۰۸ خرداد',
                        '۰۹ خرداد',
                        '۱۰ خرداد',
                        '۱۱ خرداد',
                        '۱۲ خرداد',
                    ],
                },
            },
            thisYear: {
                value: 12948921,
                growShrink: 6.3,
                comparePeriod: 'از سال گذشته',
                chartData: {
                    series: [
                        {
                            name: 'تاثیرات',
                            data: [
                                240110, 255123, 210097, 275121, 230110, 280137,
                                220115, 340171, 305146, 350167, 300145, 420202,
                            ],
                        },
                    ],
                    date: [
                        'فروردین',
                        'اردیبهشت',
                        'خرداد',
                        'تیر',
                        'مرداد',
                        'شهریور',
                        'مهر',
                        'آبان',
                        'آذر',
                        'دی',
                        'بهمن',
                        'اسفند',
                    ],
                },
            },
        },
    },
    salesTarget: {
        thisWeek: {
            target: 400,
            achieved: 260,
            percentage: 65,
        },
        thisMonth: {
            target: 1750,
            achieved: 1320,
            percentage: 75,
        },
        thisYear: {
            target: 22000,
            achieved: 15823,
            percentage: 71,
        },
    },
    recentOrders: [
        {
            id: '92627',
            date: 1657332800,
            customer: 'Tara Fletcher',
            status: 0,
            paymentMehod: 'master',
            paymentIdendifier: '•••• 0921',
            totalAmount: 279,
        },
        {
            id: '92509',
            date: 1656232800,
            customer: 'Joyce Freeman',
            status: 1,
            paymentMehod: 'visa',
            paymentIdendifier: '•••• 1232',
            totalAmount: 831,
        },
        {
            id: '91631',
            date: 1655532800,
            customer: 'Brittany Hale',
            status: 0,
            paymentMehod: 'visa',
            paymentIdendifier: '•••• 4597',
            totalAmount: 142,
        },
        {
            id: '90963',
            date: 1654932800,
            customer: 'Luke Cook',
            status: 0,
            paymentMehod: 'master',
            paymentIdendifier: '•••• 3881',
            totalAmount: 232,
        },
        {
            id: '89332',
            date: 1654132800,
            customer: 'Eileen Horton',
            status: 1,
            paymentMehod: 'paypal',
            paymentIdendifier: '••••@gmail.com',
            totalAmount: 597,
        },
        {
            id: '89107',
            date: 1650132800,
            customer: 'Frederick Adams',
            status: 2,
            paymentMehod: 'visa',
            paymentIdendifier: '•••• 3356',
            totalAmount: 72,
        },
        {
            id: '89021',
            date: 1649832800,
            customer: 'Lee Wheeler',
            status: 0,
            paymentMehod: 'master',
            paymentIdendifier: '•••• 9564',
            totalAmount: 110,
        },
    ],
    topProduct: [
        {
            id: '18',
            name: 'Maneki Neko Poster',
            productCode: '098336NT',
            img: '/img/products/product-7.jpg',
            sales: 1249,
            growShrink: 15.2,
        },
        {
            id: '14',
            name: 'Echoes Necklace',
            productCode: '098383NT',
            img: '/img/products/product-3.jpg',
            sales: 1145,
            growShrink: 13.9,
        },
        {
            id: '20',
            name: 'Spiky Ring',
            productCode: '098392NT',
            img: '/img/products/product-9.jpg',
            sales: 1073,
            growShrink: 9.5,
        },
        {
            id: '21',
            name: 'Pastel Petals Poster',
            productCode: '098355NT',
            img: '/img/products/product-10.jpg',
            sales: 1022,
            growShrink: 2.3,
        },
        {
            id: '23',
            name: 'Il Limone',
            productCode: '098377NT',
            img: '/img/products/product-12.jpg',
            sales: 992,
            growShrink: -0.7,
        },
        {
            id: '17',
            name: 'Ringed Earring',
            productCode: '098314NT',
            img: '/img/products/product-6.jpg',
            sales: 1201,
            growShrink: -1.1,
        },
    ],
    customerDemographic: [
        {
            id: 'us',
            name: 'United States',
            value: 38.61,
            coordinates: [-95.7129, 37.0902],
        },
        {
            id: 'br',
            name: 'Brazil',
            value: 32.79,
            coordinates: [-51.9253, -14.235],
        },
        {
            id: 'in',
            name: 'India',
            value: 26.42,
            coordinates: [78.9629, 20.5937],
        },
        {
            id: 'uk',
            name: 'United Kingdom',
            value: 17.42,
            coordinates: [0.1278, 51.5074],
        },
        {
            id: 'tr',
            name: 'Turkey',
            value: 12.85,
            coordinates: [28.9784, 41.0082],
        },
    ],
    revenueByChannel: {
        thisWeek: {
            value: 21827.13,
            growShrink: 11.4,
            percentage: {
                onlineStore: 24,
                physicalStore: 35,
                socialMedia: 41,
            },
        },
        thisMonth: {
            value: 82373.21,
            growShrink: 3.4,
            percentage: {
                onlineStore: 28,
                physicalStore: 32,
                socialMedia: 40,
            },
        },
        thisYear: {
            value: 329489.21,
            growShrink: 5.1,
            percentage: {
                onlineStore: 24,
                physicalStore: 38,
                socialMedia: 38,
            },
        },
    },
}

export const projectData = {
    projectOverview: {
        ongoingProject: 12,
        projectCompleted: 68,
        upcomingProject: 7,
    },
    taskOverview: {
        weekly: {
            onGoing: 126,
            finished: 87,
            total: 213,
            series: [
                {
                    name: 'در حال انجام',
                    data: [45, 52, 68, 84, 103, 112, 126],
                },
                {
                    name: 'تکمیل شده',
                    data: [35, 41, 62, 62, 75, 81, 87],
                },
            ],
            range: [
                '21 بهمن',
                '22 بهمن',
                '23 بهمن',
                '24 بهمن',
                '25 بهمن',
                '26 بهمن',
                '27 بهمن',
            ],
        },
        daily: {
            onGoing: 25,
            finished: 18,
            total: 43,
            series: [
                {
                    name: 'در حال انجام',
                    data: [15, 20, 23, 24, 25],
                },
                {
                    name: 'تکمیل شده',
                    data: [10, 12, 15, 17, 18],
                },
            ],
            range: ['08:00', '12:00', '16:00', '20:00', '24:00'],
        },
    },
    currentTasks: taskBugFix,
    schedule: [
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1,
            ),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                8,
            ),
            name: 'طراحی',
            id: 'fd521fec-35bb-4c84-abc7-df590afc9076',
            progress: 40,
            type: 'project',
            hideChildren: false,
            displayOrder: 1,
            barVariant: 'overallDesign',
        },
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1,
            ),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                2,
                12,
                28,
            ),
            name: 'پژوهش کاربر',
            id: '2102bc55-6b7a-4218-b5d8-ed9ecc5fc737',
            progress: 85,
            type: 'task',
            project: 'fd521fec-35bb-4c84-abc7-df590afc9076',
            displayOrder: 2,
            barVariant: 'design',
        },
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                2,
            ),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                4,
                0,
                0,
            ),
            name: 'سیستم طراحی',
            id: 'ae9ebb76-5241-4c24-a921-b4b704a7edbd',
            progress: 35,
            dependencies: ['2102bc55-6b7a-4218-b5d8-ed9ecc5fc737'],
            type: 'task',
            project: 'fd521fec-35bb-4c84-abc7-df590afc9076',
            displayOrder: 3,
            barVariant: 'design',
        },
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                4,
            ),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                8,
                0,
                0,
            ),
            name: 'پروتوتایپ',
            id: '4bd47b1d-bb51-40f4-843e-0e4dd632b5e7',
            progress: 60,
            dependencies: ['ae9ebb76-5241-4c24-a921-b4b704a7edbd'],
            type: 'task',
            project: 'fd521fec-35bb-4c84-abc7-df590afc9076',
            displayOrder: 4,
            barVariant: 'design',
        },
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                6,
            ),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                20,
            ),
            name: 'توسعه',
            id: '96c97159-aaff-45d0-b874-74e4aa059b0f',
            progress: 40,
            type: 'project',
            hideChildren: false,
            displayOrder: 5,
            barVariant: 'overallDevelopment',
        },
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                6,
            ),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
            name: 'معماری زیرساخت',
            id: '3209fd05-a73d-4947-84d9-cd0f6a286238',
            progress: 20,
            type: 'task',
            project: '96c97159-aaff-45d0-b874-74e4aa059b0f',
            displayOrder: 6,
            barVariant: 'development',
        },
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                9,
            ),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                15,
            ),
            name: 'توسعه هسته',
            id: '68b2a36f-74b3-432a-a7f5-ec66db501514',
            progress: 10,
            type: 'task',
            project: '96c97159-aaff-45d0-b874-74e4aa059b0f',
            displayOrder: 7,
            barVariant: 'development',
        },
        {
            start: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                12,
            ),
            end: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                20,
            ),
            name: 'یکپارچه سازی',
            id: '7d59bda8-c78e-4b7d-b66d-a5862f4c2644',
            progress: 10,
            type: 'task',
            project: '96c97159-aaff-45d0-b874-74e4aa059b0f',
            displayOrder: 8,
            barVariant: 'development',
        },
    ],
    recentActivity: [
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
            comment: `خوب، جاوا ممکن است مثال خوبی از این باشد که یک زبان برنامه نویسی باید چگونه باشد. اما برنامه های جاوا نمونه های خوبی از این هستند که برنامه ها نباید شبیه باشند.`,
        },
        {
            type: 'ADD-TAGS-TO-TICKET',
            dateTime: 1646574027,
            userName: 'Eugene Stewart',
            tags: ['Live Issue', 'Backend'],
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
            comment: `<strong>@Carolyn</strong> یکی از دلایل اصلی سقوط امپراتوری روم این بود که نداشتن صفر - آنها هیچ راهی برای پایان موفقیت آمیز برنامه های C خود نداشتند. `,
        },
        {
            type: 'ASSIGN-TICKET',
            dateTime: 1646554397,
            userName: 'Lee Wheeler',
            assignee: 'Alvin Moreno',
            ticket: 'PD-1092',
        },
    ],
}

export const analyticsData = {
    thisMonth: {
        metrics: {
            visitors: {
                value: 149328,
                growShrink: 5.2,
            },
            conversionRate: {
                value: 6.8,
                growShrink: -1.8,
            },
            adCampaignClicks: {
                value: 17333,
                growShrink: 2.3,
            },
        },
        webAnalytic: {
            pageView: {
                value: 32124,
                growShrink: 4.2,
            },
            avgTimeOnPage: {
                value: '3m 16s',
                growShrink: -0.2,
            },
            series: [
                {
                    name: 'طبیعی',
                    data: [
                        45756, 52543, 38853, 24234, 33654, 26654, 21872, 20124,
                        65431, 84255, 15354, 10023,
                    ],
                },
                {
                    name: 'ارجاع',
                    data: [
                        35434, 41654, 62396, 42352, 13146, 18653, 29543, 37867,
                        36810, 51491, 32257, 35542,
                    ],
                },
                {
                    name: 'مستقیم',
                    data: [
                        87122, 57872, 74768, 99322, 75147, 38764, 62533, 47234,
                        82741, 56325, 45781, 47582,
                    ],
                },
            ],
            date: [
                '11 خرداد',
                '12 خرداد',
                '13 خرداد',
                '14 خرداد',
                '15 خرداد',
                '16 خرداد',
                '17 خرداد',
                '18 خرداد',
                '19 خرداد',
                '20 خرداد',
                '21 خرداد',
                '22 خرداد',
                '23 خرداد',
            ]

        },
        traffic: [
            {
                source: 'مستقیم',
                visits: 1500,
                uniqueVisitors: 1200,
                bounceRate: '40%',
                avgSessionDuration: '00:03:45',
                progress: 60,
            },
            {
                source: 'طبیعی',
                visits: 3000,
                uniqueVisitors: 2500,
                bounceRate: '35%',
                avgSessionDuration: '00:04:20',
                progress: 75,
            },
            {
                source: 'ارجاع',
                visits: 1000,
                uniqueVisitors: 850,
                bounceRate: '45%',
                avgSessionDuration: '00:03:10',
                progress: 80,
            },
            {
                source: 'رسانه‌های اجتماعی',
                visits: 2000,
                uniqueVisitors: 1800,
                bounceRate: '50%',
                avgSessionDuration: '00:02:50',
                progress: 40,
            },
            {
                source: 'کمپین ایمیل',
                visits: 800,
                uniqueVisitors: 700,
                bounceRate: '30%',
                avgSessionDuration: '00:05:00',
                progress: 55,
            },
        ],
        topChannel: {
            visitors: 79328,
            channels: [
                {
                    id: 'google',
                    name: 'Google',
                    img: '/img/others/google.png',
                    total: 31731,
                    percentage: 40,
                },
                {
                    id: 'instagram',
                    name: 'Instagram',
                    img: '/img/thumbs/instagram.png',
                    total: 23798,
                    percentage: 30,
                },
                {
                    id: 'facebook',
                    name: 'Facebook',
                    img: '/img/thumbs/facebook.png',
                    total: 11899,
                    percentage: 15,
                },
                {
                    id: 'x',
                    name: 'X',
                    img: '/img/thumbs/x.png',
                    total: 10313,
                    percentage: 13,
                },
            ],
        },
        deviceSession: {
            labels: ['دسکتاپ', 'موبایل', 'تبلت'],
            series: [35103, 24633, 14441],
            percentage: [42.1, 33.7, 19.6],
        },
        topPages: [
            {
                pageUrl: '/dashboard',
                views: {
                    amount: 6465,
                    growth: 1.7,
                },
                uniqueVisitor: {
                    amount: 1078,
                    growth: 1.2,
                },
            },
            {
                pageUrl: '/affiliate',
                views: {
                    amount: 3687,
                    growth: 1.4,
                },
                uniqueVisitor: {
                    amount: 801,
                    growth: 0.9,
                },
            },
            {
                pageUrl: '/contract',
                views: {
                    amount: 2918,
                    growth: 2.6,
                },
                uniqueVisitor: {
                    amount: 655,
                    growth: 1.4,
                },
            },
            {
                pageUrl: '/products',
                views: {
                    amount: 4882,
                    growth: -0.7,
                },
                uniqueVisitor: {
                    amount: 936,
                    growth: -0.3,
                },
            },
            {
                pageUrl: '/sign-in',
                views: {
                    amount: 1527,
                    growth: 1.1,
                },
                uniqueVisitor: {
                    amount: 389,
                    growth: 0.8,
                },
            },
            {
                pageUrl: '/about',
                views: {
                    amount: 2103,
                    growth: -0.9,
                },
                uniqueVisitor: {
                    amount: 450,
                    growth: -1.5,
                },
            },
        ],
    },
    thisYear: {
        metrics: {
            visitors: {
                value: 1749853,
                growShrink: 12.4,
            },
            conversionRate: {
                value: 7.2,
                growShrink: 0.8,
            },
            adCampaignClicks: {
                value: 214987,
                growShrink: 15.6,
            },
        },
        webAnalytic: {
            pageView: {
                value: 420354,
                growShrink: 4.8,
            },
            avgTimeOnPage: {
                value: '3m 18s',
                growShrink: -0.3,
            },
            series: [
                {
                    name: 'طبیعی',
                    data: [
                        50234, 46231, 54322, 61234, 48231, 52312, 57234, 51234,
                        46234, 54312, 61231, 57234,
                    ],
                },
                {
                    name: 'ارجاع',
                    data: [
                        42312, 41234, 45321, 53212, 48234, 45312, 49234, 42321,
                        51234, 48231, 45312, 50234,
                    ],
                },
                {
                    name: 'مستقیم',
                    data: [
                        57312, 65234, 61231, 54312, 59234, 64321, 67234, 61231,
                        55234, 59234, 64312, 67231,
                    ],
                },
            ],
            date: [
                'فروردین',
                'اردیبهشت',
                'خرداد',
                'تیر',
                'مرداد',
                'شهریور',
                'مهر',
                'آبان',
                'آذر',
                'دی',
                'بهمن',
                'اسفند'
            ],
        },
        traffic: [
            {
                source: 'Direct',
                visits: 18000,
                uniqueVisitors: 14500,
                bounceRate: '38%',
                avgSessionDuration: '00:03:50',
                progress: 65,
            },
            {
                source: 'Natural',
                visits: 36000,
                uniqueVisitors: 30000,
                bounceRate: '34%',
                avgSessionDuration: '00:04:25',
                progress: 78,
            },
            {
                source: 'Referral',
                visits: 12000,
                uniqueVisitors: 10200,
                bounceRate: '42%',
                avgSessionDuration: '00:03:15',
                progress: 82,
            },
            {
                source: 'Social Media',
                visits: 24000,
                uniqueVisitors: 21600,
                bounceRate: '48%',
                avgSessionDuration: '00:02:55',
                progress: 45,
            },
            {
                source: 'Email Campaign',
                visits: 9600,
                uniqueVisitors: 8400,
                bounceRate: '28%',
                avgSessionDuration: '00:05:05',
                progress: 60,
            },
        ],
        topChannel: {
            visitors: 930540,
            channels: [
                {
                    id: 'google',
                    name: 'Google',
                    img: '/img/others/google.png',
                    total: 372216,
                    percentage: 40,
                },
                {
                    id: 'instagram',
                    name: 'Instagram',
                    img: '/img/thumbs/instagram.png',
                    total: 279162,
                    percentage: 30,
                },
                {
                    id: 'facebook',
                    name: 'Facebook',
                    img: '/img/thumbs/facebook.png',
                    total: 139581,
                    percentage: 15,
                },
                {
                    id: 'x',
                    name: 'X',
                    img: '/img/thumbs/x.png',
                    total: 120970,
                    percentage: 13,
                },
            ],
        },
        deviceSession: {
            labels: ['Desktop', 'Mobile', 'Tablet'],
            series: [421236, 295596, 177396],
            percentage: [43.5, 30.5, 18.2],
        },
        topPages: [
            {
                pageUrl: '/dashboard',
                views: {
                    amount: 77580,
                    growth: 2.0,
                },
                uniqueVisitor: {
                    amount: 12936,
                    growth: 1.4,
                },
            },
            {
                pageUrl: '/affiliate',
                views: {
                    amount: 44244,
                    growth: 1.6,
                },
                uniqueVisitor: {
                    amount: 9612,
                    growth: 1.1,
                },
            },
            {
                pageUrl: '/contract',
                views: {
                    amount: 35016,
                    growth: 3.0,
                },
                uniqueVisitor: {
                    amount: 7860,
                    growth: 1.7,
                },
            },
            {
                pageUrl: '/products',
                views: {
                    amount: 58584,
                    growth: -0.5,
                },
                uniqueVisitor: {
                    amount: 11232,
                    growth: -0.2,
                },
            },
            {
                pageUrl: '/sign-in',
                views: {
                    amount: 18324,
                    growth: 1.3,
                },
                uniqueVisitor: {
                    amount: 4668,
                    growth: 0.9,
                },
            },
            {
                pageUrl: '/about',
                views: {
                    amount: 25236,
                    growth: -1.0,
                },
                uniqueVisitor: {
                    amount: 5412,
                    growth: -1.6,
                },
            },
        ],
    },
    thisWeek: {
        metrics: {
            visitors: {
                value: 35200,
                growShrink: 3.8,
            },
            conversionRate: {
                value: 7.1,
                growShrink: -0.5,
            },
            adCampaignClicks: {
                value: 4120,
                growShrink: 1.9,
            },
        },
        webAnalytic: {
            pageView: {
                value: 7450,
                growShrink: 2.7,
            },
            avgTimeOnPage: {
                value: '3m 20s',
                growShrink: 0.1,
            },
            series: [
                {
                    name: 'طبیعی',
                    data: [6543, 5234, 7432, 8123, 6032, 7456, 8223],
                },
                {
                    name: 'ارجاع',
                    data: [5423, 6123, 4832, 5421, 6832, 7221, 6645],
                },
                {
                    name: 'مستقیم',
                    data: [8321, 7564, 9234, 10234, 9345, 8732, 9434],
                },
            ],
            date: [
                'دوشنبه',
                'سه شنبه',
                "چهارشنبه",
                'پنجشنبه',
                'جمعه',
                'شنبه',
                "یکشنبه",
            ],
        },
        traffic: [
            {
                source: 'Direct',
                visits: 750,
                uniqueVisitors: 640,
                bounceRate: '39%',
                avgSessionDuration: '00:03:50',
                progress: 61,
            },
            {
                source: 'Natural',
                visits: 1500,
                uniqueVisitors: 1280,
                bounceRate: '36%',
                avgSessionDuration: '00:04:25',
                progress: 74,
            },
            {
                source: 'Referral',
                visits: 500,
                uniqueVisitors: 430,
                bounceRate: '44%',
                avgSessionDuration: '00:03:15',
                progress: 78,
            },
            {
                source: 'Social Media',
                visits: 1000,
                uniqueVisitors: 890,
                bounceRate: '49%',
                avgSessionDuration: '00:02:55',
                progress: 43,
            },
            {
                source: 'Email Campaign',
                visits: 400,
                uniqueVisitors: 350,
                bounceRate: '29%',
                avgSessionDuration: '00:05:10',
                progress: 57,
            },
        ],
        topChannel: {
            visitors: 18090,
            channels: [
                {
                    id: 'google',
                    name: 'Google',
                    img: '/img/others/google.png',
                    total: 7236,
                    percentage: 40,
                },
                {
                    id: 'instagram',
                    name: 'Instagram',
                    img: '/img/thumbs/instagram.png',
                    total: 5427,
                    percentage: 30,
                },
                {
                    id: 'facebook',
                    name: 'Facebook',
                    img: '/img/thumbs/facebook.png',
                    total: 2714,
                    percentage: 15,
                },
                {
                    id: 'x',
                    name: 'X',
                    img: '/img/thumbs/x.png',
                    total: 2353,
                    percentage: 13,
                },
            ],
        },
        deviceSession: {
            labels: ['Desktop', 'Mobile', 'Tablet'],
            series: [8021, 5612, 3457],
            percentage: [44.3, 31.0, 19.1],
        },
        topPages: [
            {
                pageUrl: '/dashboard',
                views: {
                    amount: 1452,
                    growth: 2.2,
                },
                uniqueVisitor: {
                    amount: 236,
                    growth: 1.5,
                },
            },
            {
                pageUrl: '/affiliate',
                views: {
                    amount: 879,
                    growth: 1.5,
                },
                uniqueVisitor: {
                    amount: 191,
                    growth: 1.0,
                },
            },
            {
                pageUrl: '/contract',
                views: {
                    amount: 698,
                    growth: 2.8,
                },
                uniqueVisitor: {
                    amount: 157,
                    growth: 1.7,
                },
            },
            {
                pageUrl: '/products',
                views: {
                    amount: 1165,
                    growth: -0.4,
                },
                uniqueVisitor: {
                    amount: 223,
                    growth: -0.1,
                },
            },
            {
                pageUrl: '/sign-in',
                views: {
                    amount: 364,
                    growth: 1.2,
                },
                uniqueVisitor: {
                    amount: 93,
                    growth: 0.8,
                },
            },
            {
                pageUrl: '/about',
                views: {
                    amount: 501,
                    growth: -0.8,
                },
                uniqueVisitor: {
                    amount: 107,
                    growth: -1.3,
                },
            },
        ],
    },
}

export const marketingData = {
    kpiSummary: {
        totalMarketingSpend: {
            value: 192817,
            growShrink: 5.3,
        },
        roi: {
            value: 270,
            growShrink: 8.1,
        },
        conversionRates: {
            value: 4.5,
            growShrink: 0.9,
        },
        totalLeads: {
            value: 1289,
            growShrink: 16.2,
        },
    },
    adsPerformance: {
        campagin: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160],
        email: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16],
        label: [
            '01 دی',
            '02 دی',
            '03 دی',
            '04 دی',
            '05 دی',
            '06 دی',
            '07 دی',
            '08 دی',
            '09 دی',
            '10 دی',
            '11 دی',
            '12 دی',
        ],
    },
    leadPerformance: {
        categories: [
            'حجم لید',
            'نرخ تبدیل',
            'کیفیت لید',
            'زمان پاسخ',
            'هزینه برای هر لید',
        ],
        series: [78, 57, 26, 76, 42],
    },
    recentCampaign: [
        {
            id: '9b528c7c-2a14-4b28-a757-01ec7f658977',
            name: 'فروش تابستانی',
            startDate: moment(currentDate).subtract(10, 'days').format('jYYYY/jMM/jDD'),
            endDate: moment(currentDate).add(3, 'days').format('jYYYY/jMM/jDD'),
            budget: 20000,
            leadsGenerated: 500,
            conversions: 50,
            conversionRate: 10,
            status: 'completed',
            type: 'promotional',
            audienceGroup: ['General Public'],
        },
        {
            id: '094ab259-bab2-40e0-8264-2a778d049dcf',
            name: 'پروموی بازگشت به مدرسه',
            startDate: moment(currentDate).subtract(5, 'days').format('jYYYY/jMM/jDD'),
            endDate: moment(currentDate).add(4, 'days').format('jYYYY/jMM/jDD'),
            budget: 15000,
            leadsGenerated: 400,
            conversions: 35,
            conversionRate: 8.75,
            status: 'active',
            type: 'seasonal',
            audienceGroup: ['Students and Parents'],
        },
        {
            id: '5ee0a8f9-5426-4dfc-8aef-801aa377bea7',
            name: 'راه‌اندازی محصول جدید',
            startDate: moment(currentDate).subtract(2, 'days').format('jYYYY/jMM/jDD'),
            endDate: moment(currentDate).add(6, 'days').format('jYYYY/jMM/jDD'),
            budget: 30000,
            leadsGenerated: 600,
            conversions: 60,
            conversionRate: 10,
            status: 'active',
            type: 'seasonal',
            audienceGroup: ['Tech Enthusiasts'],
        },
        {
            id: '8c6239d0-c512-46e6-9a08-fc3735229c77',
            name: 'راهنما هدیه',
            startDate: moment(currentDate).subtract(5, 'days').format('jYYYY/jMM/jDD'),
            endDate: moment(currentDate).add(4, 'days').format('jYYYY/jMM/jDD'),
            budget: 50000,
            leadsGenerated: 0,
            conversions: 0,
            conversionRate: 0,
            status: 'scheduled',
            type: 'launch',
            audienceGroup: ['Gift Shoppers'],
        },
        {
            id: '7e35f7cb-04d5-4acc-a881-ab3faba1d310',
            name: 'فروش انبار',
            startDate: moment(currentDate).subtract(5, 'days').format('jYYYY/jMM/jDD'),
            endDate: moment(currentDate).add(4, 'days').format('jYYYY/jMM/jDD'),
            budget: 10000,
            leadsGenerated: 300,
            conversions: 20,
            conversionRate: 6.67,
            status: 'active',
            type: 'promotional',
            audienceGroup: ['Existing Customers'],
        },
    ],
}
