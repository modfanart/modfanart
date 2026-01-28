import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'RegionMapDoc'

const demoHeader = {
    title: 'نقشه منطقه (RegionMap)',
    desc: 'کامپوننت ساده داده‌های جغرافیایی که بر اساس <a class="text-indigo-600 underline" href="https://www.react-simple-maps.io/" target="_blank">react-simple-maps</a> ساخته شده است.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: `مثال استفاده.`,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'نقشه منطقه (RegionMap)',
        api: [
            {
                propName: 'data',
                type: `<code>Array<{name: string, value: string | number}></code>`,
                default: `<code>[]</code>`,
                desc: 'داده‌های نقشه',
            },
            {
                propName: 'mapSource',
                type: `<code>string</code> | <code>string[]</code>`,
                default: ``,
                desc: 'SVG جغرافیایی، برای مشاهده SVG‌های جغرافیای بیشتر می‌توانید به <a class="text-indigo-600 underline" href="https://github.com/deldersveld/topojson/tree/master/countries" target="_blank" rel="noopener noreferrer">این مخزن</a> مراجعه کنید',
            },
            {
                propName: 'valuePrefix',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نمایش محتوای پیشوند قبل از مقدار',
            },
            {
                propName: 'valueSuffix',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'نمایش محتوای پسوند کنار مقدار',
            },
        ],
    },
]


const RegionMapDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="shared"
        />
    )
}

export default RegionMapDoc
