import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import useScrollTop from '@/utils/hooks/useScrollTop';

const Example = () => {
    const { isSticky } = useScrollTop();

    return (
        <header className={isSticky ? 'sticky' : ''}>
            <h1>My Sticky Header</h1>
        </header>
    );
};

export default Example
`}</SyntaxHighlighter>
    )
}

export default Example
