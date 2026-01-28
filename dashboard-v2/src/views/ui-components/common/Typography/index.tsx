import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Heading from './Heading'
import FontWeight from './FontWeight'
import Text from './Text'
import List from './List'
import TextOverflow from './TextOverflow'
import Prose from './Prose'

const mdPath = 'Typography'

const demoHeader = {
    title: 'تایپوگرافی (Typography)',
    desc: 'نمونه‌هایی از تایپوگرافی‌های پرکاربرد.',
}

const demos = [
    {
        mdName: 'Heading',
        mdPath: mdPath,
        title: 'عنوان (Heading)',
        desc: ``,
        component: <Heading />,
    },
    {
        mdName: 'Text',
        mdPath: mdPath,
        title: 'متن (Text)',
        desc: ``,
        component: <Text />,
    },
    {
        mdName: 'FontWeight',
        mdPath: mdPath,
        title: 'وزن فونت (Font weight)',
        desc: ``,
        component: <FontWeight />,
    },
    {
        mdName: 'List',
        mdPath: mdPath,
        title: 'فهرست (List)',
        desc: ``,
        component: <List />,
    },
    {
        mdName: 'TextOverflow',
        mdPath: mdPath,
        title: 'تراکم متن (Text overflow)',
        desc: ``,
        component: <TextOverflow />,
    },
    {
        mdName: 'Prose',
        mdPath: mdPath,
        title: 'آثار نویسندگی (Prose)',
        desc: `افزونه تایپوگرافی Tailwind CSS مجموعه‌ای از کلاس‌های <code>prose</code> را برای افزودن پیش‌فرض‌های زیبا در تایپوگرافی به هر HTML ساده که شما کنترل نمی‌کنید، مانند HTML رندر شده از Markdown یا گرفته شده از CMS، فراهم می‌آورد.`,
        component: <Prose />,
    },
]


const Typography = () => {
    return <DemoLayout header={demoHeader} demos={demos} />
}

export default Typography
