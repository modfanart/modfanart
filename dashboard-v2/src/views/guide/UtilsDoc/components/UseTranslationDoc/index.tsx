import DemoComponentApi from '@/components/docs/DemoComponentApi'
import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'UseTranslationDoc'

const demoHeader = {
    title: 'useTranslation',
    desc: `<p><code>useTranslation</code> is a custom wrapper around <code>react-i18next</code>'s <code>useTranslation</code>.</p>`,
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
                propName: 'usePlaceholder',
                type: `<code>boolean</code>	`,
                default: '-',
                desc: 'A flag indicating whether to use a placeholder translation function.',
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
                api: [
                    {
                        propName: 't',
                        type: `<code>(key: string, fallback?: string | Record<string, string | number>) => string</code>`,
                        default: '-',
                        desc: 'A translation function that returns the translated string or the fallback if no translation is found.',
                    },
                    {
                        propName: 'ready',
                        type: `<code>boolean</code>`,
                        default: '-',
                        desc: 'Indicates whether the translations are ready to be used.',
                    },
                    {
                        propName: 'i18n',
                        type: `<code>string</code>`,
                        default: '-',
                        desc: 'The i18n instance or an empty string in placeholder mode.',
                    },
                ],
            },
        ]}
    />
)

const UseTranslationDoc = () => {
    return (
        <DemoLayout
            hideApiTitle
            hideFooter
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            mdPrefixPath="utils"
            extra={extra}
            api={demoApi}
            keyText="param"
        />
    )
}

export default UseTranslationDoc
