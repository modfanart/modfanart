import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import RangePicker from './RangePicker'
import DateTimePicker from './DateTimePicker'
import Controlled from './Controlled'
import Format from './Format'
import CustomRender from './CustomRender'
import DisableOutOfPeriodDate from './DisableOutOfPeriodDate'
import DisabledCertainDate from './DisabledCertainDate'
import DateViewCount from './DateViewCount'
import Inputtable from './Inputtable'
import DisabledInput from './DisabledInput'
import InputSize from './InputSize'
import InputAffix from './InputAffix'
import ClearButton from './ClearButton'
import Localization from './Localization'

const mdPath = 'DatePicker'

const demoHeader = {
    title: 'انتخاب تاریخ (DatePicker)',
    desc: 'انتخاب تاریخ به کاربران این امکان را می‌دهد که تاریخ را از طریق یک تقویم پاپ‌آپ انتخاب کنند.',
}
const demos = [
    {
        mdName: 'Basic',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده معمولی از کامپوننت DatePicker.`,
        component: <Basic />,
    },
    {
        mdName: 'RangePicker',
        mdPath: mdPath,
        title: 'انتخاب بازه (Range picker)',
        desc: `استفاده معمولی از کامپوننت RangePicker.`,
        component: <RangePicker />,
    },
    {
        mdName: 'DateTimePicker',
        mdPath: mdPath,
        title: 'انتخاب تاریخ و زمان (Date time picker)',
        desc: `ترکیب <code> &lt;DatePicker /&gt;</code> و <code> &lt;TimeInput /&gt;</code>`,
        component: <DateTimePicker />,
    },
    {
        mdName: 'Controlled',
        mdPath: mdPath,
        title: 'کنترل‌شده (Controlled)',
        desc: `استفاده کنترل‌شده با <code> &lt;DatePicker /&gt;</code> و <code> &lt;DatePickerRange /&gt;</code>`,
        component: <Controlled />,
    },
    {
        mdName: 'Format',
        mdPath: mdPath,
        title: 'فرمت (Format)',
        desc: `انتخاب‌گر به ما این امکان را می‌دهد که فرمت تاریخ ورودی و انتخاب‌گر را از طریق props <code>inputFormat</code> و <code>labelFormat</code> تنظیم کنیم.`,
        component: <Format />,
    },
    {
        mdName: 'CustomRender',
        mdPath: mdPath,
        title: 'رندر سفارشی (Custom Render)',
        desc: `شما می‌توانید عناصر روز سفارشی را رندر کنید یا از طریق props <code>dayStyle</code>، <code>dayClassName</code> و <code>renderDay</code> به روزها استایل و کلاس اعمال کنید.`,
        component: <CustomRender />,
    },
    {
        mdName: 'DisableOutOfPeriodDate',
        mdPath: mdPath,
        title: 'غیرفعال کردن تاریخ‌های خارج از بازه (Disable out of period date)',
        desc: `با تنظیم props <code>minDate</code> و <code>maxDate</code> می‌توان تاریخ‌های قابل انتخاب را محدود به یک بازه خاص کرد.`,
        component: <DisableOutOfPeriodDate />,
    },
    {
        mdName: 'DisabledCertainDate',
        mdPath: mdPath,
        title: 'غیرفعال کردن تاریخ‌های خاص (Disabled certain date)',
        desc: `با استفاده از callback در prop <code>disabledDate</code> می‌توان برخی از تاریخ‌ها را غیرفعال کرد.`,
        component: <DisabledCertainDate />,
    },
    {
        mdName: 'DateViewCount',
        mdPath: mdPath,
        title: 'چندین نمایش تاریخ (Multiple date view)',
        desc: `با تنظیم prop <code>dateViewCount</code> بیشتر از <code>1</code> می‌توان چندین نمایش از تاریخ داشت.`,
        component: <DateViewCount />,
    },
    {
        mdName: 'DisabledInput',
        mdPath: mdPath,
        title: 'غیرفعال کردن ورودی (Disabled Input)',
        desc: `با استفاده از prop <code>disabled</code> می‌توان ورودی DatePicker را غیرفعال کرد.`,
        component: <DisabledInput />,
    },
    {
        mdName: 'Inputtable',
        mdPath: mdPath,
        title: 'قابلیت ورود دستی (Inputtable)',
        desc: `قفل ورودی را آزاد کنید تا کاربر بتواند تاریخ را به صورت دستی وارد کند.`,
        component: <Inputtable />,
    },
    {
        mdName: 'InputSize',
        mdPath: mdPath,
        title: 'اندازه ورودی (Input Size)',
        desc: `DatePicker به ما این امکان را می‌دهد که اندازه ورودی را از طریق prop <code>size</code> کنترل کنیم.`,
        component: <InputSize />,
    },
    {
        mdName: 'InputAffix',
        mdPath: mdPath,
        title: 'پسوند ورودی (Input Affix)',
        desc: `<code>inputSuffix</code> یا <code>inputPrefix</code> به ما این امکان را می‌دهند که محتوای پسوند ورودی را سفارشی کنیم.`,
        component: <InputAffix />,
    },
    {
        mdName: 'ClearButton',
        mdPath: mdPath,
        title: 'دکمه پاکسازی (Clear Button)',
        desc: `شما می‌توانید دکمه پاکسازی را از طریق props <code>clearable</code> یا <code>clearButton</code> سفارشی کنید.`,
        component: <ClearButton />,
    },
    {
        mdName: 'Localization',
        mdPath: mdPath,
        title: 'موقعیت‌یابی (Localization)',
        desc: `DatePicker مقدار locale را از <code> &lt;ConfigProvider /&gt;</code> دریافت می‌کند، اما همچنین گزینه‌ای برای وارد کردن locale به صورت دستی وجود دارد.`,
        component: <Localization />,
    },
]
const demoApi = [
    {
        component: 'انتخاب تاریخ (DatePicker)',
        api: [
            {
                propName: 'clearable',
                type: '<code>boolean</code>',
                default: '<code>true</code>',
                desc: 'آیا اجازه می‌دهد مقدار پاک شود'
            },
            {
                propName: 'clearButton',
                type: '<code>string</code> | <code>ReactNode</code>',
                default: '<code>ReactNode</code>',
                desc: 'دکمه پاک‌کردن سفارشی'
            },
            {
                propName: 'closePickerOnChange',
                type: '<code>boolean</code>',
                default: '<code>true</code>',
                desc: 'آیا پس از انتخاب تاریخ، پنجره انتخاب تاریخ بسته شود'
            },
            {
                propName: 'dateViewCount',
                type: '<code>number</code>',
                default: '<code>1</code>',
                desc: 'تعداد نمایش تاریخ‌ها در پنجره انتخاب تاریخ'
            },
            {
                propName: 'dayClassName',
                type: '<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => string</code>',
                default: '-',
                desc: 'اعمال کلاس به روزها بر اساس آرگومان'
            },
            {
                propName: 'dayStyle',
                type: '<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => CSSProperties</code>',
                default: '-',
                desc: 'اعمال استایل به روزها بر اساس آرگومان'
            },
            {
                propName: 'defaultValue',
                type: '<code>Date</code>',
                default: '-',
                desc: 'مقدار پیش‌فرض DatePicker (در صورتی که کنترل‌شده نباشد، از value استفاده کنید)'
            },
            {
                propName: 'defaultMonth',
                type: '<code>Date</code>',
                default: '-',
                desc: 'ماه پیش‌فرض برای DatePicker کنترل‌نشده'
            },
            {
                propName: 'defaultOpen',
                type: '<code>boolean</code>',
                default: '<code>false</code>',
                desc: 'آیا DatePicker به طور پیش‌فرض باز باشد'
            },
            {
                propName: 'defaultView',
                type: '<code>\'date\'</code> | <code>\'month\'</code> | <code>\'year\'</code>',
                default: '<code>\'date\'</code>',
                desc: 'نمای پیش‌فرض DatePicker'
            },
            {
                propName: 'disabled',
                type: '<code>boolean</code>',
                default: '<code>false</code>',
                desc: 'تعیین اینکه آیا ورودی DatePicker غیرفعال باشد'
            },

            {
                propName: 'disabledDate',
                type: '<code>(date: Date) => boolean</code>',
                default: '-',
                desc: 'تعیین تاریخ‌هایی که نمی‌توانند انتخاب شوند'
            },
            {
                propName: 'disableOutOfMonth',
                type: '<code>boolean</code>',
                default: '<code>false</code>',
                desc: 'آیا باید روزهایی که خارج از ماه داده‌شده هستند غیرفعال شوند'
            },
            {
                propName: 'enableHeaderLabel',
                type: '<code>boolean</code>',
                default: '<code>true</code>',
                desc: 'فعال‌کردن برچسب هدر برای تغییر نمای تقویم'
            },
            {
                propName: 'firstDayOfWeek',
                type: '<code>\'sunday\'</code> | <code>\'monday\'</code>',
                default: '<code>\'monday\'</code>',
                desc: 'اولین روز هفته'
            },
            {
                propName: 'hideOutOfMonthDates',
                type: '<code>boolean</code>',
                default: '<code>false</code>',
                desc: 'آیا باید روزهایی که خارج از ماه داده‌شده هستند مخفی شوند'
            },
            {
                propName: 'hideWeekdays',
                type: '<code>boolean</code>',
                default: '<code>false</code>',
                desc: 'آیا باید روزهای هفته مخفی شوند'
            },
            {
                propName: 'inputFormat',
                type: '<code>string</code>',
                default: '<code>\'YYYY-MM-DD\'</code>',
                desc: 'فرمت نمایش ورودی DatePicker'
            },
            {
                propName: 'inputPrefix',
                type: '<code>string</code> | <code>ReactNode</code>',
                default: '-',
                desc: 'نمایش محتوای پیش‌وند داخل ورودی DatePicker'
            },
            {
                propName: 'inputSuffix',
                type: '<code>string</code> | <code>ReactNode</code>',
                default: '-',
                desc: 'نمایش محتوای پس‌وند داخل ورودی DatePicker'
            },
            {
                propName: 'inputtable',
                type: '<code>boolean</code>',
                default: '<code>false</code>',
                desc: 'آیا اجازه تایپ در ورودی داده می‌شود'
            },
            {
                propName: 'labelFormat',
                type: '<code>{month: string, year: string}</code>',
                default: '<code>{month: \'MMM\', year: \'YYYY\'}</code>',
                desc: 'فرمت برچسب تاریخ'
            },
            {
                propName: 'locale',
                type: '<a href="https://github.com/iamkun/dayjs/tree/dev/src/locale" target="_blank" rel="noopener noreferrer"><code>dayjs locale</code></a>',
                default: '<code>en</code>',
                desc: 'زبان محلی DatePicker'
            },
            {
                propName: 'maxDate',
                type: '<code>Date</code>',
                default: '-',
                desc: 'تاریخ بیشینه برای انتخاب'
            },
            {
                propName: 'minDate',
                type: '<code>Date</code>',
                default: '-',
                desc: 'تاریخ کمینه برای انتخاب'
            },
            {
                propName: 'monthLabelFormat',
                type: '<code>string</code>',
                default: '<code>\'YYYY\'</code>',
                desc: 'فرمت برچسب ماه'
            },
            {
                propName: 'onBlur',
                type: '<code>function(event: Event)</code>',
                default: '-',
                desc: 'کال‌بک زمانی که ورودی DatePicker از حالت فوکوس خارج می‌شود'
            },
            {
                propName: 'onChange',
                type: '<code>function(date: Date)</code>',
                default: '-',
                desc: 'کال‌بک زمانی که یک تاریخ انتخاب می‌شود'
            },
            {
                propName: 'onDayMouseEnter',
                type: '<code>function(date: Date)</code>',
                default: '-',
                desc: 'کال‌بک زمانی که روی روزی هاور می‌شود'
            },
            {
                propName: 'onFocus',
                type: '<code>function(event: Event)</code>',
                default: '-',
                desc: 'کال‌بک زمانی که ورودی DatePicker فوکوس می‌شود'
            },
            {
                propName: 'onDropdownClose',
                type: '<code>() => void</code>',
                default: '-',
                desc: 'کال‌بک زمانی که DatePicker بسته می‌شود'
            },
            {
                propName: 'onDropdownOpen',
                type: '<code>() => void</code>',
                default: '-',
                desc: 'کال‌بک زمانی که DatePicker باز می‌شود'
            },
            {
                propName: 'openPickerOnClear',
                type: '<code>boolean</code>',
                default: '<code>false</code>',
                desc: 'آیا باید DatePicker پس از پاک‌کردن مقدار باز شود'
            },
            {
                propName: 'range',
                type: '<code>[Date | null, Date | null]</code>',
                default: '-',
                desc: 'هایلایت کردن محدوده تاریخ داده‌شده'
            },
            {
                propName: 'renderDay',
                type: '<code>(date: Date) => ReactNode</code>',
                default: '<code>false</code>',
                desc: 'رندر کردن روز سفارشی بر اساس پارامترهای داده‌شده'
            },
            {
                propName: 'size',
                type: '<code>\'sm\'</code> | <code>\'md\'</code> | <code>\'lg\'</code>',
                default: '<code>\'md\'</code>',
                desc: 'اندازه ورودی DatePicker'
            },
            {
                propName: 'value',
                type: '<code>Date</code>',
                default: '-',
                desc: 'مقدار DatePicker (کنترل‌شده)'
            },
            {
                propName: 'weekdayLabelFormat',
                type: '<code>string</code>',
                default: '<code>\'dd\'</code>',
                desc: 'فرمت نمایش روزهای هفته'
            },
            {
                propName: 'weekendDays',
                type: '<code>number[]</code>',
                default: '<code>[0, 6]</code>',
                desc: 'تعیین روزهای تعطیل هفته'
            },
            {
                propName: 'yearLabelFormat',
                type: '<code>string</code>',
                default: '<code>\'YYYY\'</code>',
                desc: 'فرمت برچسب سال'
            }
        ],
    },
    {
        component: 'انتخاب تاریخ (DatePicker.DatePickerRange)',
        api: [
            {
                propName: 'clearable',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا اجازه می‌دهید مقدار پاک شود؟',
            },
            {
                propName: 'clearButton',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `<code>ReactNode</code>`,
                desc: 'دکمه پاک کردن سفارشی',
            },
            {
                propName: 'closePickerOnChange',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا پس از انتخاب تاریخ، پنجره انتخاب بسته شود؟',
            },
            {
                propName: 'dateViewCount',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: 'تعداد نمایش تاریخ در پنجره انتخاب تاریخ',
            },
            {
                propName: 'dayClassName',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => string</code>`,
                default: `-`,
                desc: 'اعمال کلاس نام به روزها بر اساس آرگومان‌ها',
            },
            {
                propName: 'dayStyle',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => CSSProperties</code>`,
                default: `-`,
                desc: 'اعمال استایل به روزها بر اساس آرگومان‌ها',
            },
            {
                propName: 'defaultValue',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'مقدار پیش‌فرض برای DatePickerRange (اگر کنترل‌شده است، از value استفاده کنید)',
            },
            {
                propName: 'defaultMonth',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'ماه پیش‌فرض برای DatePickerRange کنترل نشده',
            },
            {
                propName: 'defaultOpen',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا DatePickerRange به طور پیش‌فرض باز باشد؟',
            },
            {
                propName: 'defaultView',
                type: `<code>'date'</code> | <code>'month'</code> | <code>'year'</code> `,
                default: `<code>'date'</code>`,
                desc: 'نمایش پیش‌فرض DatePickerRange',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'مشخص می‌کند که آیا ورودی DatePickerRange غیرفعال است یا نه',
            },
            {
                propName: 'disabledDate',
                type: `<code>(date: Date) => boolean</code>`,
                default: `-`,
                desc: 'مشخص می‌کند که کدام تاریخ‌ها قابل انتخاب نیستند',
            },
            {
                propName: 'disableOutOfMonth',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهایی که خارج از ماه داده‌شده‌اند غیرفعال شوند؟',
            },
            {
                propName: 'enableHeaderLabel',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا برچسب هدر برای تغییر نمایش فعال باشد؟',
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
                desc: 'آیا روزهایی که خارج از ماه داده‌شده‌اند مخفی شوند؟',
            },
            {
                propName: 'hideWeekdays',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا روزهای هفته مخفی شوند؟',
            },
            {
                propName: 'inputFormat',
                type: `<code>string</code>`,
                default: `<code>'YYYY-MM-DD'</code>`,
                desc: 'فرمت نمایش ورودی DatePickerRange',
            },
            {
                propName: 'inputPrefix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند در ورودی DatePickerRange',
            },
            {
                propName: 'inputSuffix',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `-`,
                desc: 'نمایش محتوای پسوند در ورودی DatePickerRange',
            },            
            {
                propName: 'inputtable',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا تایپ ورودی مجاز است',
            },
            {
                propName: 'inputtableBlurClose',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا هنگام blur (خارج شدن از فیلد) DatePicker بسته می‌شود (فقط زمانی که inputtable برابر با true باشد)',
            },
            {
                propName: 'labelFormat',
                type: `<code>string</code>`,
                default: `<code>'~'</code>`,
                desc: 'فاصله‌گذار بین نمایش تاریخ در ورودی',
            },
            {
                propName: 'locale',
                type: `<a href="https://github.com/iamkun/dayjs/tree/dev/src/locale" target="_blank" rel="noopener noreferrer"><code>dayjs locale</code></a>`,
                default: `<code>en</code>`,
                desc: 'زبان DatePickerRange',
            },
            {
                propName: 'maxDate',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'حداکثر تاریخ انتخابی',
            },
            {
                propName: 'minDate',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'حداقل تاریخ انتخابی',
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
                desc: 'کال‌بک زمانی که سلول تاریخ انتخاب می‌شود',
            },
            {
                propName: 'onDayMouseEnter',
                type: `<code>function(date: Date)</code>`,
                default: `-`,
                desc: 'کال‌بک زمانی که تاریخ موس روی آن قرار می‌گیرد',
            },
            {
                propName: 'onDropdownClose',
                type: `<code>() => void</code>`,
                default: `-`,
                desc: 'کال‌بک زمانی که DatePickerRange بسته می‌شود',
            },
            {
                propName: 'onDropdownOpen',
                type: `<code>() => void</code>`,
                default: `-`,
                desc: 'کال‌بک زمانی که DatePickerRange باز می‌شود',
            },
            {
                propName: 'openPickerOnClear',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا پس از پاک کردن مقدار، DatePickerRange باز می‌شود',
            },
            {
                propName: 'range',
                type: `<code>[Date | null, Date | null]</code>`,
                default: `-`,
                desc: 'برجسته کردن بازه تاریخی مشخص شده',
            },
            {
                propName: 'renderDay',
                type: `<code>(date: Date) => ReactNode</code>`,
                default: `<code>false</code>`,
                desc: 'رندر کردن عنصر روز سفارشی بر اساس پارامترهای داده شده',
            },
            {
                propName: 'separator',
                type: `<code>string</code>`,
                default: `<code>'~'</code>`,
                desc: 'فاصله‌گذار بین تاریخ‌ها',
            },
            {
                propName: 'size',
                type: `<code>'sm'</code> | <code>'md'</code> | <code>'lg'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه ورودی DatePickerRange',
            },
            {
                propName: 'singleDate',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا فقط یک تاریخ قابل انتخاب است',
            },
            {
                propName: 'value',
                type: `<code>[Date | null, Date | null]</code>`,
                default: `-`,
                desc: 'مقدار DatePickerRange (Controlled)',
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
                desc: 'روزهای آخر هفته را نشان می‌دهد',
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
        component:  'انتخاب تاریخ (DatePicker.DateTimepicker)',
        api: [
            {
                propName: 'amPm',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا باید فرمت زمان به 12 ساعته تنظیم شود؟',
            },
            {
                propName: 'clearable',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا اجازه پاک کردن مقدار داده شده است؟',
            },
            {
                propName: 'clearButton',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: `<code>ReactNode</code>`,
                desc: 'دکمه پاک کردن سفارشی',
            },
            {
                propName: 'closePickerOnChange',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا هنگام انتخاب تاریخ باید انتخاب‌گر بسته شود؟',
            },
            {
                propName: 'dateViewCount',
                type: `<code>number</code>`,
                default: `<code>1</code>`,
                desc: 'تعداد نمایش تاریخ در انتخاب‌گر',
            },
            {
                propName: 'dayClassName',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => string</code>`,
                default: `-`,
                desc: 'اعمال کلاس به روزها بر اساس آرگومان داده شده',
            },
            {
                propName: 'dayStyle',
                type: `<code>(date: Date, modifiers: {disabled: boolean, weekend: boolean, selectedInRange: boolean, selected: boolean, inRange: boolean, firstInRange: boolean, lastInRange: boolean, outOfMonth: boolean}) => CSSProperties</code>`,
                default: `-`,
                desc: 'اعمال استایل به روزها بر اساس آرگومان داده شده',
            },
            {
                propName: 'defaultValue',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'مقدار پیش‌فرض DateTimepicker (در صورتی که کنترل شده نیست، از value استفاده کنید)',
            },
            {
                propName: 'defaultMonth',
                type: `<code>Date</code>`,
                default: `-`,
                desc: 'ماه پیش‌فرض برای DateTimepicker کنترل نشده',
            },
            {
                propName: 'defaultOpen',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا به صورت پیش‌فرض DateTimepicker باید باز باشد؟',
            },
            {
                propName: 'defaultView',
                type: `<code>'date'</code> | <code>'month'</code> | <code>'year'</code>`,
                default: `<code>'date'</code>`,
                desc: 'نمایش پیش‌فرض DateTimepicker',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'تعیین اینکه آیا ورودی DateTimepicker غیرفعال است یا خیر',
            },
            {
                propName: 'disabledDate',
                type: `<code>(date: Date) => boolean</code>`,
                default: `-`,
                desc: 'تعیین تاریخ‌هایی که قابل انتخاب نیستند',
            },
            {
                propName: 'disableOutOfMonth',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا باید روزهایی که خارج از ماه داده شده‌اند غیرفعال شوند؟',
            },
            {
                propName: 'enableHeaderLabel',
                type: `<code>boolean</code>`,
                default: `<code>true</code>`,
                desc: 'آیا باید برچسب هدر برای تغییر نمای انتخاب‌گر فعال باشد؟',
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
                desc: 'آیا باید روزهای خارج از ماه داده شده مخفی شوند؟',
            },
            {
                propName: 'hideWeekdays',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا باید روزهای هفته مخفی شوند؟',
            },
            {
                propName: 'inputFormat',
                type: `<code>string</code>`,
                default: `<code>'YYYY-MM-DD'</code>`,
                desc: 'فرمت نمایش ورودی DateTimepicker',
            },            
            {
                propName: "inputPrefix",
                type: "<code>string</code> | <code>ReactNode</code>",
                default: "-",
                desc: "محتویات پیشوند را در ورودی DateTimepicker نمایش دهد"
            },
            {
                propName: "inputSuffix",
                type: "<code>string</code> | <code>ReactNode</code>",
                default: "-",
                desc: "محتویات پسوند را در ورودی DateTimepicker نمایش دهد"
            },
            {
                propName: "labelFormat",
                type: "<code>{month: string, year: string}</code>",
                default: "<code>{month: 'MMM', year: 'YYYY'}</code>",
                desc: "آیا اجازه تایپ در ورودی را می‌دهد؟"
            },
            {
                propName: "locale",
                type: "<a href=\"https://github.com/iamkun/dayjs/tree/dev/src/locale\" target=\"_blank\" rel=\"noopener noreferrer\"><code>dayjs locale</code></a>",
                default: "<code>en</code>",
                desc: "زبان DateTimepicker"
            },
            {
                propName: "maxDate",
                type: "<code>Date</code>",
                default: "-",
                desc: "حداکثر تاریخ انتخابی"
            },
            {
                propName: "minDate",
                type: "<code>Date</code>",
                default: "-",
                desc: "حداقل تاریخ انتخابی"
            },
            {
                propName: "monthLabelFormat",
                type: "<code>string</code>",
                default: "<code>'YYYY'</code>",
                desc: "فرمت برچسب ماه"
            },
            {
                propName: "okButtonContent",
                type: "<code>string</code> | <code>ReactNode</code>",
                default: "<code>'ok'</code>",
                desc: "محتویات دکمه تایید"
            },
            {
                propName: "onBlur",
                type: "<code>function(event: Event)</code>",
                default: "-",
                desc: "کال بک هنگام از دست دادن فوکوس ورودی DateTimepicker"
            },
            {
                propName: "onChange",
                type: "<code>function(date: Date)</code>",
                default: "-",
                desc: "کال بک هنگام انتخاب سلول تاریخ"
            },
            {
                propName: "onDayMouseEnter",
                type: "<code>function(date: Date)</code>",
                default: "-",
                desc: "کال بک هنگام قرار گرفتن موس روی تاریخ"
            },
            {
                propName: "onFocus",
                type: "<code>function(event: Event)</code>",
                default: "-",
                desc: "کال بک هنگام فوکوس ورودی DateTimepicker"
            },
            {
                propName: "onDropdownClose",
                type: "<code>() => void</code>",
                default: "-",
                desc: "کال بک هنگام بسته شدن DateTimepicker"
            },
            {
                propName: "onDropdownOpen",
                type: "<code>() => void</code>",
                default: "-",
                desc: "کال بک هنگام باز شدن DateTimepicker"
            },
            {
                propName: "openPickerOnClear",
                type: "<code>boolean</code>",
                default: "<code>false</code>",
                desc: "آیا DateTimepicker هنگام پاک کردن مقدار باز شود؟"
            },
            {
                propName: "range",
                type: "<code>[Date | null, Date | null]</code>",
                default: "-",
                desc: "محدوده تاریخ داده شده را هایلایت کند"
            },
            {
                propName: "renderDay",
                type: "<code>(date: Date) => ReactNode</code>",
                default: "<code>false</code>",
                desc: "رندر المان سفارشی روز بر اساس پارامترهای داده شده"
            },
            {
                propName: "size",
                type: "<code>'sm'</code> | <code>'md'</code> | <code>'lg'</code>",
                default: "<code>'md'</code>",
                desc: "اندازه ورودی DateTimepicker"
            },
            {
                propName: "value",
                type: "<code>Date</code>",
                default: "-",
                desc: "مقدار DateTimepicker (کنترل شده)"
            },
            {
                propName: "weekdayLabelFormat",
                type: "<code>string</code>",
                default: "<code>'dd'</code>",
                desc: "فرمت نمایش روز هفته"
            },
            {
                propName: "weekendDays",
                type: "<code>number[]</code>",
                default: "<code>[0, 6]</code>",
                desc: "روزهای تعطیل را نشان می‌دهد"
            },
            {
                propName: "yearLabelFormat",
                type: "<code>string</code>",
                default: "<code>'YYYY'</code>",
                desc: "فرمت برچسب سال"
            }
        ],
    },
]

const DatePicker = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default DatePicker
