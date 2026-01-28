import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Basic from './Basic'
import Size from './Size'
import MultipleSelection from './MultipleSelection'
import Disabled from './Disabled'
import Custom from './Custom'
import Controlled from './Controlled'

const mdPath = 'Segment'

const demoHeader = {
    title: 'بخش (Segment)',
    desc: 'بخش‌ها گروهی از گزینه‌های مرتبط را نمایش می‌دهند که امکان روشن یا خاموش کردن آنها برای کاربر فراهم می‌شود.',
}

const demos = [
    {
        mdName: 'پایه (Basic)',
        mdPath: mdPath,
        title: 'پایه (Basic)',
        desc: `استفاده اساسی از بخش.`,
        component: <Basic />,
    },
    {
        mdName: 'اندازه (Size)',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `بخش‌ها اندازه‌های دقیقی مشابه <code>Button</code> دارند.`,
        component: <Size />,
    },
    {
        mdName: 'انتخاب چندگانه (Multiple Selection)',
        mdPath: mdPath,
        title: 'انتخاب چندگانه (Multiple Selection)',
        desc: `بخش از انتخاب چندگانه پشتیبانی می‌کند، با تنظیم <code>selectionType</code> به <code>multiple</code>.`,
        component: <MultipleSelection />,
    },
    {
        mdName: 'غیرفعال (Disabled)',
        mdPath: mdPath,
        title: 'غیرفعال (Disabled)',
        desc: `با افزودن پراپ <code>disabled</code>، آیتم بخش را غیرفعال کنید.`,
        component: <Disabled />,
    },
    {
        mdName: 'سفارشی (Custom)',
        mdPath: mdPath,
        title: 'بخش سفارشی (Custom Segment)',
        desc: `آیتم بخش به ما اجازه می‌دهد که پراپ را به عنوان فرزند نمایش دهیم تا گزینه‌های ظاهری سفارشی‌تری ایجاد کنیم.`,
        component: <Custom />,
    },
    {
        mdName: 'کنترل شده (Controlled)',
        mdPath: mdPath,
        title: 'کنترل شده (Controlled)',
        desc: `چند نمونه از بخش‌های کنترل شده.`,
        component: <Controlled />,
    },
]

const demoApi = [
    {
        component: 'بخش (Segment)',
        api: [
            {
                propName: 'defaultValue',
                type: `<code>string[]</code>`,
                default: `-`,
                desc: 'مقدار اولیه برای بخش بدون کنترل',
            },
            {
                propName: 'onChange',
                type: `<code>(segmentValue: string | string[]) => void</code>`,
                default: `-`,
                desc: 'فراخوانی هنگام تغییر مقدار بخش',
            },
            {
                propName: 'selectionType',
                type: `<code>'single' | 'multiple'</code>`,
                default: `<code>'single'</code>`,
                desc: 'آیا فقط یک آیتم یا چند آیتم می‌توانند در یک زمان انتخاب شوند',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code> | <code>'xs'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه تمامی آیتم‌های بخش.',
            },
            {
                propName: 'value',
                type: `<code>string[]</code>`,
                default: `-`,
                desc: 'مقدار کنترل شده آیتم بخش برای فعال کردن',
            },
        ],
    },
    {
        component: 'آیتم بخش (Segment.Item)',
        api: [
            {
                propName: 'children',
                type: `<code>({active: boolean, disabled: boolean, value: string[], ref: string, onSegmentItemClick: () => void}) => ReactNode | ReactNode</code>`,
                default: `-`,
                desc: 'فرزند آیتم بخش',
            },
            {
                propName: 'disabled',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'آیا آیتم بخش غیرفعال است',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code> | <code>'xs'</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه آیتم بخش.',
            },
            {
                propName: 'value',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'یک مقدار منحصر به فرد برای آیتم بخش',
            },
        ],
    },
]

const Segment = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Segment
