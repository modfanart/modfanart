import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Example from './Example'

const mdPath = 'SyntaxHighlighterDoc'

const demoHeader = {
    title: 'هایلایتر نحو (SyntaxHighlighter)',
    desc: 'این کامپوننت یک بسته‌بندی از <a class="underline text-primary" href="https://github.com/react-syntax-highlighter/react-syntax-highlighter" target="_blank">react-syntax-highlighter</a> است.',
}

const demos = [
    {
        mdName: 'Example',
        mdPath: mdPath,
        title: 'مثال (Example)',
        desc: 'مثال استفاده.',
        component: <Example />,
    },
]


const reactSyntaxHighlighterApi = (
    <div className="demo-api-table mb-12">
        <h4 className="mb-5">وابستگی‌ها</h4>
        <h6 id="react-syntax-highlighter-api" className="mb-3">
            react-syntax-highlighter
        </h6>
        <p>
            تمامی ویژگی‌های react-syntax-highlighter را می‌توان بر روی این
            کامپوننت اعمال کرد، برای مشاهده لیست کامل{' '}
            <a
                className="underline text-primary"
                href="https://github.com/react-syntax-highlighter/react-syntax-highlighter#props"
                target="_blank"
                rel="noreferrer"
            >
                مستندات رسمی
            </a>{' '}
            مراجعه کنید.
        </p>
    </div>
)


const SyntaxHighlighterDoc = () => {
    return (
        <DemoLayout
            innerFrame={false}
            header={demoHeader}
            demos={demos}
            mdPrefixPath="shared"
            extra={reactSyntaxHighlighterApi}
        />
    )
}

export default SyntaxHighlighterDoc
