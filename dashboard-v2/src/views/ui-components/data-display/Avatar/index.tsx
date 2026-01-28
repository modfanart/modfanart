import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Shape from './Shape'
import Size from './Size'
import Type from './Type'
import Color from './Color'
import Status from './Status'
import Group from './Group'

const mdPath = 'Avatar'

const demoHeader = {
    title: 'آواتار (Avatar)',
    desc: 'کامپوننت آواتار برای نمایش یک کاربر یا برند محصول استفاده می‌شود و می‌تواند متن، آیکون‌ها یا تصاویر را نمایش دهد.',
}

const demos = [
    {
        mdName: 'Shape',
        mdPath: mdPath,
        title: 'شکل (Shape)',
        desc: `آواتار <code>shape</code> می‌تواند به صورت <code>circle</code>، <code>rounded</code> یا <code>square</code> باشد.`,
        component: <Shape />,
    },
    {
        mdName: 'Size',
        mdPath: mdPath,
        title: 'اندازه (Size)',
        desc: `کامپوننت آواتار در ۳ اندازه <code>sm</code>، <code>md</code> و <code>lg</code> موجود است، همچنین امکان تعیین اندازه سفارشی وجود دارد.`,
        component: <Size />,
    },
    {
        mdName: 'Type',
        mdPath: mdPath,
        title: 'نوع (Type)',
        desc: `آواتار می‌تواند متن، آیکون‌ها یا تصاویر را نمایش دهد.`,
        component: <Type />,
    },
    {
        mdName: 'Color',
        mdPath: mdPath,
        title: 'رنگ (Color)',
        desc: `رنگ‌ها می‌توانند از طریق پراپ‌های <code>backgroundColor</code> و <code>textColor</code> به آواتار متن و آیکون‌ها اعمال شوند.`,
        component: <Color />,
    },
    {
        mdName: 'Status',
        mdPath: mdPath,
        title: 'وضعیت (Status)',
        desc: `آواتار همچنین می‌تواند نشان وضعیت داشته باشد که همراه با کامپوننت <code>Badge</code> نمایش داده می‌شود.`,
        component: <Status />,
    },
    {
        mdName: 'Group',
        mdPath: mdPath,
        title: 'گروه آواتار (Avatar Group)',
        desc: `چندین آواتار را در یک ردیف به هم متصل کنید.`,
        component: <Group />,
    },
]

const demoApi = [
    {
        component: 'آواتار (Avatar)',
        api: [
            {
                propName: 'shape',
                type: `<code>'rounded'</code> | <code>'square'</code> | <code>'circle'</code>`,
                default: `<code>'rounded'</code>`,
                desc: 'شکل آواتار',
            },
            {
                propName: 'size',
                type: `<code>'lg'</code> | <code>'md'</code> | <code>'sm'</code> | <code>number</code>`,
                default: `<code>'md'</code>`,
                desc: 'اندازه آواتار',
            },
            {
                propName: 'icon',
                type: `<code>ReactNode</code>`,
                default: `-`,
                desc: 'آیکون آواتار',
            },
            {
                propName: 'src',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'آدرس تصویر آواتار',
            },
            {
                propName: 'srcSet',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'ویژگی srcset برای تصویر آواتار',
            },
            {
                propName: 'alt',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'ویژگی alt برای تصویر آواتار',
            },
        ],
    },
    {
        component: 'گروه آواتار (Avatar.Group)',
        api: [
            {
                propName: 'chained',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا آواتارها در گروه به هم متصل شوند',
            },
            {
                propName: 'maxCount',
                type: `<code>number</code>`,
                default: `<code>4</code>`,
                desc: 'حداکثر تعداد آواتارهایی که باید نمایش داده شوند و آواتار حذف شده را اضافه کند',
            },
            {
                propName: 'omittedAvatarContent',
                type: `<code>string</code> | <code>ReactNode</code>`,
                default: ``,
                desc: 'محتوای آواتار حذف شده سفارشی',
            },
            {
                propName: 'omittedAvatarProps',
                type: `<code>Object</code> (Refer to Avatar props above)`,
                default: `-`,
                desc: 'پراپ‌های آواتار حذف شده',
            },
            {
                propName: 'omittedAvatarTooltip',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'آیا برای آواتار حذف شده تولتیپ فعال باشد',
            },
            {
                propName: 'onOmittedAvatarClick',
                type: `<code>() => void</code>`,
                default: `-`,
                desc: 'کال‌بک وقتی که آواتار حذف شده کلیک می‌شود',
            },
            {
                propName: 'omittedAvatarTooltipProps',
                type: `<code>Object</code>`,
                default: `-`,
                desc: 'پراپ‌های تولتیپ آواتار حذف شده، برای جزئیات به پراپ‌های تولتیپ مراجعه کنید',
            },
        ],
    },
]


const Avatar = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default Avatar
