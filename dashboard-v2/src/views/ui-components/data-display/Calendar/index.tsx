import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Range from './Range'
import CustomRender from './CustomRender'
import DisabledCertainDate from './DisabledCertainDate'
import DisableOutOfPeriodDate from './DisableOutOfPeriodDate'
import MultipleDateView from './MultipleDateView'
import MultipleSelection from './MultipleSelection'

const mdPath = 'Calendar'

const demoHeader = {
    title: 'تقویم (Calendar)',
    desc: 'کامپوننت تقویم برای دسته‌بندی محتوا با یک کلمه کلیدی استفاده می‌شود.',
}

const demos = [
    {
        mdName: 'پایه',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: 'استفاده پایه از تقویم.',
        component: <Basic />,
    },
    {
        mdName: 'محدوده',
        mdPath: mdPath,
        title: 'محدوده (Range)',
        desc: 'تقویم محدوده رفتار مشابهی با تقویم دارد، اما قادر به انتخاب تاریخ شروع و پایان است.',
        component: <Range />,
    },
    {
        mdName: 'رندر سفارشی',
        mdPath: mdPath,
        title: 'رندر سفارشی (Custom render)',
        desc: 'شما می‌توانید المان‌های روز سفارشی رندر کنید یا استایل‌ها و کلاس‌ها را با این ویژگی‌ها <code>dayStyle</code>، <code>dayClassName</code> و <code>renderDay</code> به روزها اعمال کنید.',
        component: <CustomRender />,
    },
    {
        mdName: 'تاریخ‌های غیرفعال مشخص',
        mdPath: mdPath,
        title: 'تاریخ‌های غیرفعال مشخص (Disabled certain date)',
        desc: 'قسمت‌هایی از تاریخ‌ها را با استفاده از ویژگی <code>disabledDate</code> غیرفعال کنید.',
        component: <DisabledCertainDate />,
    },
    {
        mdName: 'تاریخ‌های غیرفعال خارج از دوره',
        mdPath: mdPath,
        title: 'تاریخ‌های غیرفعال خارج از دوره (Disable out of period date)',
        desc: 'با تنظیم ویژگی‌های <code>minDate</code> و <code>maxDate</code>، تاریخ‌های قابل دسترس را در یک دوره محدود کنید.',
        component: <DisableOutOfPeriodDate />,
    },
    {
        mdName: 'نمای چندتایی تاریخ',
        mdPath: mdPath,
        title: 'نمای چندتایی تاریخ (Multiple date view)',
        desc: 'تقویم یا تقویم محدوده می‌تواند نمای چندتایی تاریخ داشته باشد با تنظیم ویژگی <code>dateViewCount</code> بیشتر از <code>1</code>.',
        component: <MultipleDateView />,
    },
    {
        mdName: 'انتخاب چندگانه',
        mdPath: mdPath,
        title: 'انتخاب چندگانه (Multiple selection)',
        desc: 'کامپوننت تقویم اجازه می‌دهد تاریخ‌های متعدد را با تنظیم ویژگی <code>multipleSelection</code> انتخاب کنید.',
        component: <MultipleSelection />,
    },
]


const demoApi = [
    {
        component: 'تقویم (Calendar)',
        api: [
            {
                propName: 'dateViewCount',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: 'تعداد نمایش تاریخ‌ها در انتخاب‌کننده تاریخ',
            },
            {
                propName: 'dayClassName',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => string</code>`,
                default: `-`,
                desc: 'اعمال className به روزها بر اساس آرگومان‌ها',
            },
            {
                propName: 'dayStyle',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => CSSProperties</code>`,
                default: `-`,
                desc: 'اعمال استایل به روزها بر اساس آرگومان‌ها',
            },
            {
                propName: 'defaultMonth',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'ماه پیش‌فرض برای DatePickerRange بدون کنترل'
            },
            {
                propName: 'defaultView',
                type: `<code>'date'</code> | <code>'month'</code> | <code>'year'</code>`,
                default: `<code>'date'</code>`,
                desc: 'نمایش پیش‌فرض DatePickerRange',
            },
            {
                propName: 'disabledDate',
                type: `<code>(date: Date) => boolean</code>`,
                default: `-`,
                desc: 'مشخص کردن تاریخی که قابل انتخاب نیست',
            },
            {
                propName: 'disableOutOfMonth',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهایی که خارج از ماه داده‌شده هستند غیرفعال شوند',
            },
            {
                propName: 'enableHeaderLabel',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا غیرفعال کردن برچسب هدر برای تغییر نمای تاریخ مجاز است',
            },
            {
                propName: 'firstDayOfWeek',
                type: `<code>'sunday'</code> | <code>'monday'</code>`,
                default: `<code>'monday'</code>`,
                desc: 'روز اول هفته',
            },
            {
                propName: 'hideOutOfMonthDates',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهایی که خارج از ماه داده‌شده هستند پنهان شوند',
            },
            {
                propName: 'hideWeekdays',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهای هفته پنهان شوند',
            },
            {
                propName: 'isDateFirstInRange',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => boolean</code>`,
                default: `-`,
                desc: 'هایلایت کردن تاریخ به عنوان اولین تاریخ در یک بازه',
            },
            {
                propName: 'isDateInRange',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => boolean</code>`,
                default: `-`,
                desc: 'هایلایت کردن تاریخ در یک بازه',
            },
            {
                propName: 'isDateLastInRange',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => boolean</code>`,
                default: `-`,
                desc: 'هایلایت کردن تاریخ به عنوان آخرین تاریخ در یک بازه',
            },
            {
                propName: 'labelFormat',
                type: `<code>string</code>`,
                default: `<code>'~'</code>`,
                desc: 'فاصله‌گذاری بین نمایش تاریخ‌ها در ورودی',
            },
            {
                propName: 'locale',
                type: `<a href="https://github.com/iamkun/dayjs/tree/dev/src/locale" target="_blank" rel="noopener noreferrer"><code>dayjs locale</code></a>`,
                default: `<code>en</code>`,
                desc: 'محلی‌سازی DatePickerRange',
            },
            {
                propName: 'maxDate',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'حداکثر تاریخ قابل انتخاب',
            },
            {
                propName: 'minDate',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'حداقل تاریخ قابل انتخاب',
            },
            {
                propName: 'monthLabelFormat',
                type: `<code>string</code>`,
                default: `<code>'YYYY'</code>`,
                desc: 'فرمت برچسب ماه',
            },
            {
                propName: 'onChange',
                type: `<code>function(date: Date)</code>`,
                default: `-`,
                desc: 'تابع برگشتی هنگام انتخاب تاریخ',
            },
            {
                propName: 'onDayMouseEnter',
                type: `<code>function(date: Date)</code>`,
                default: `-`,
                desc: 'تابع برگشتی هنگام حرکت ماوس روی تاریخ',
            },
            {
                propName: 'paginateBy',
                type: `<code>number</code>`,
                default: `<code>dateViewCount</code> | <code>1</code>`,
                desc: 'صفحه‌بندی بر اساس تعداد نمایش‌ها',
            },
            {
                propName: 'preventFocus',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'ممانعت از فوکوس هنگام کلیک',
            },
            {
                propName: 'range',
                type: `<code>[Date | null, Date | null]</code>`,
                default: `-`,
                desc: 'هایلایت کردن بازه تاریخ داده‌شده',
            },
            {
                propName: 'renderDay',
                type: `<code>(date: Date) => ReactNode</code>`,
                default: `<code>false</code>`,
                desc: 'رندر کردن عنصر سفارشی برای روزها بر اساس پارامترهای داده‌شده',
            },
            {
                propName: 'value',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'مقدار تقویم (کنترل‌شده)',
            },
            {
                propName: 'weekdayLabelFormat',
                type: `<code>string</code>`,
                default: `<code>'dd'</code>`,
                desc: 'فرمت نمایش روزهای هفته',
            },
            {
                propName: 'weekendDays',
                type: `<code>number[]</code>`,
                default: `<code>[0, 6]</code>`,
                desc: 'مشخص کردن روزهای تعطیلات آخر هفته',
            },
            {
                propName: 'yearLabelFormat',
                type: `<code>string</code>`,
                default: `<code>'YYYY'</code>`,
                desc: 'فرمت برچسب سال',
            },            
        ],
    },
    {
        component: 'تقویم محدوده (RangeCalendar)',
        api: [
            {
                propName: 'dateViewCount',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: 'تعداد نمایش تاریخ‌ها در پیکر',
            },
            {
                propName: 'dayClassName',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => string</code>`,
                default: `-`,
                desc: 'اعمال کلاس برای روزها براساس آرگومان',
            },
            {
                propName: 'dayStyle',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => CSSProperties</code>`,
                default: `-`,
                desc: 'اعمال استایل برای روزها براساس آرگومان',
            },
            {
                propName: 'defaultMonth',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'ماه پیش‌فرض برای DatePickerRange غیرکنترلی',
            },
            {
                propName: 'defaultView',
                type: `<code>'date'</code> | <code>'month'</code> | <code>'year'</code>`,
                default: `<code>'date'</code>`,
                desc: 'نمای پیش‌فرض DatePickerRange',
            },
            {
                propName: 'disabledDate',
                type: `<code>(date: Date) => boolean</code>`,
                default: `-`,
                desc: 'مشخص کردن تاریخ‌هایی که قابل انتخاب نیستند',
            },
            {
                propName: 'disableOutOfMonth',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهای خارج از ماه داده‌شده غیرفعال شوند؟',
            },
            {
                propName: 'enableHeaderLabel',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا برچسب هدر برای تغییر نما غیرفعال شود؟',
            },
            {
                propName: 'firstDayOfWeek',
                type: `<code>'sunday'</code> | <code>'monday'</code>`,
                default: `<code>'monday'</code>`,
                desc: 'اولین روز هفته',
            },
            {
                propName: 'hideOutOfMonthDates',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهای خارج از ماه داده‌شده مخفی شوند؟',
            },
            {
                propName: 'hideWeekdays',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهای هفته مخفی شوند؟',
            },
            {
                propName: 'isDateFirstInRange',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => boolean</code>`,
                default: `-`,
                desc: 'هایلایت کردن تاریخ به عنوان اولین تاریخ در یک بازه',
            },
            {
                propName: 'isDateInRange',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => boolean</code>`,
                default: `-`,
                desc: 'هایلایت کردن تاریخ در یک بازه',
            },
            {
                propName: 'isDateLastInRange',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => boolean</code>`,
                default: `-`,
                desc: 'هایلایت کردن تاریخ به عنوان آخرین تاریخ در یک بازه',
            },
            {
                propName: 'labelFormat',
                type: `<code>string</code>`,
                default: `<code>'~'</code>`,
                desc: 'فاصله‌گذاری بین نمایش تاریخ‌ها در ورودی',
            },
            {
                propName: 'locale',
                type: `<a href="https://github.com/iamkun/dayjs/tree/dev/src/locale" target="_blank" rel="noopener noreferrer"><code>dayjs locale</code></a>`,
                default: `<code>en</code>`,
                desc: 'محلی‌سازی DatePickerRange',
            },
            {
                propName: 'maxDate',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'حداکثر تاریخ قابل انتخاب',
            },
            {
                propName: 'minDate',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'حداقل تاریخ قابل انتخاب',
            },
            {
                propName: 'monthLabelFormat',
                type: `<code>string</code>`,
                default: `<code>'YYYY'</code>`,
                desc: 'فرمت برچسب ماه',
            },
            {
                propName: 'onChange',
                type: `<code>function(date: Date)</code>`,
                default: `-`,
                desc: 'تابع برگشتی هنگام انتخاب تاریخ',
            },
            {
                propName: 'onDayMouseEnter',
                type: `<code>function(date: Date)</code>`,
                default: `-`,
                desc: 'تابع برگشتی هنگام حرکت ماوس روی تاریخ',
            },
            {
                propName: 'paginateBy',
                type: `<code>number</code>`,
                default: `<code>dateViewCount</code> | <code>1</code>`,
                desc: 'صفحه‌بندی بر اساس تعداد نمایش‌ها',
            },
            {
                propName: 'preventFocus',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'ممانعت از فوکوس هنگام کلیک',
            },
            {
                propName: 'range',
                type: `<code>[Date | null, Date | null]</code>`,
                default: `-`,
                desc: 'هایلایت کردن بازه تاریخ داده‌شده',
            },
            {
                propName: 'renderDay',
                type: `<code>(date: Date) => ReactNode</code>`,
                default: `<code>false</code>`,
                desc: 'رندر کردن عنصر سفارشی برای روزها بر اساس پارامترهای داده‌شده',
            },
            {
                propName: 'singleDate',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'فقط یک تاریخ می‌تواند انتخاب شود',
            },
            {
                propName: 'value',
                type: `<code>[Date | null, Date | null]</code>`,
                default: `-`,
                desc: 'مقدار تقویم (کنترل‌شده)',
            },
            {
                propName: 'weekdayLabelFormat',
                type: `<code>string</code>`,
                default: `<code>'dd'</code>`,
                desc: 'فرمت نمایش روزهای هفته',
            },
            {
                propName: 'weekendDays',
                type: `<code>number[]</code>`,
                default: `<code>[0, 6]</code>`,
                desc: 'مشخص کردن روزهای تعطیلات آخر هفته',
            },
            {
                propName: 'yearLabelFormat',
                type: `<code>string</code>`,
                default: `<code>'YYYY'</code>`,
                desc: 'فرمت برچسب سال',
            },
        ],
    },
    
]

const Calendar = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Calendar
