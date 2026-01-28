import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import useTranslation from '@/utils/hooks/useTranslation

const Example = () => {
    const { t, ready } = useTranslation(true)

    return (
        <div>
            {ready ? <p>{t('hello', 'Hello')}</p> : <p>Loading translations...</p>}
        </div>
    );
};

export default Example
`}</SyntaxHighlighter>
    )
}

export default Example
