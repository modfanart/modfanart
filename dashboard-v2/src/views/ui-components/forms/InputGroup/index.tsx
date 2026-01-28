import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Addons from './Addons'
import WithButtons from './WithButtons'
import Sizes from './Sizes'
import OtherCombination from './OtherCombination'

const mdPath = 'InputGroup'

const demoHeader = {
    title: 'گروه ورودی (InputGroup)',
    desc: 'گروه‌های ورودی این امکان را می‌دهند که چندین کامپوننت مرتبط با ورودی را در یک ردیف زنجیر کنیم.',
}

const demos = [
    {
        mdName: 'Addons',
        mdPath: mdPath,
        title: 'افزونه‌ها (Addons)',
        desc: `افزونه می‌تواند در هر یک از دو طرف ورودی قرار گیرد. همچنین می‌تواند در وسط هر دو ورودی قرار بگیرد.`,
        component: <Addons />,
    },
    {
        mdName: 'WithButtons',
        mdPath: mdPath,
        title: 'با دکمه‌ها (With Buttons)',
        desc: `دکمه‌ها نیز می‌توانند با ورودی‌ها زنجیر شوند.`,
        component: <WithButtons />,
    },
    {
        mdName: 'Sizes',
        mdPath: mdPath,
        title: 'اندازه‌ها (Sizes)',
        desc: `افزودن اندازه‌های موجود به پراپ <code>size</code> کامپوننت <code>InputGroup</code> به طور خودکار محتوای آن را تغییر اندازه می‌دهد.`,
        component: <Sizes />,
    },
    {
        mdName: 'OtherCombination',
        mdPath: mdPath,
        title: 'ترکیب‌های دیگر (Other Combination)',
        desc: `مثالی از ترکیب‌های مختلف <code>InputGroup</code>.`,
        component: <OtherCombination />,
    },
]

const demoApi = [
    {
        component: 'گروه ورودی (InputGroup)',
        api: [
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `-`,
                desc: 'اندازه گروه ورودی',
            },
        ],
    },
    {
        component: 'افزونه گروه ورودی (InputGroup.Addon)',
        api: [
            {
                propName: 'size',
                type: `<code>'lg'</code>  | <code>'md'</code> | <code>'sm'</code>`,
                default: `-`,
                desc: 'اندازه افزونه',
            },
        ],
    },
]


const InputGroup = () => {
    return <DemoLayout header={demoHeader} demos={demos} api={demoApi} />
}

export default InputGroup
