import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'FileSizeUnitDoc'

const demoHeader = {
    title: 'fileSizeUnit',
    desc: '<p><code>fileSizeUnit</code> function formats a file size (in bytes) into a human-readable string with appropriate units (kB, MB, etc.).</p>',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'Example',
        desc: ``,
        component: <Example />,
    },
]

const demoApi = [
    {
        component: 'Params',
        api: [
            {
                propName: 'bytes',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'The file size in bytes.',
            },
            {
                propName: 'si',
                type: `<code>boolean</code>`,
                default: `-`,
                desc: 'Determines whether to use SI units (base 1000) or binary units (base 1024).',
            },
            {
                propName: 'dp',
                type: `<code>number</code>`,
                default: `-`,
                desc: 'The number of decimal places to include in the formatted output.',
            },
        ],
    },
]

const extra = (
    <DemoComponentApi
        hideApiTitle
        keyText="return"
        api={[
            {
                component: 'Params',
                api: [
                    {
                        propName: 'result',
                        type: `<code>string</code>`,
                        desc: 'The formatted file size with the appropriate unit, based on the number of bytes.',
                        default: `-`,
                    },
                ],
            },
        ]}
    />
)

const FileSizeUnitDoc = () => {
    return (
        <DemoLayout
            hideApiTitle
            hideFooter
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            api={demoApi}
            mdPrefixPath="utils"
            extra={extra}
            keyText="param"
        />
    )
}

export default FileSizeUnitDoc
