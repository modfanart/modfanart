import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import useLayout from '@/utlis/hooks/useLayout';

const Example = () => {
    const { type, adaptiveCardActive, pageContainerReassemble } = useLayout();

    return (
        <div>
            <h1>Layout Type: {type}</h1>
            {adaptiveCardActive && <p>Adaptive Card is active</p>}
            {/* Example usage of pageContainerReassemble if provided */}
            {pageContainerReassemble && pageContainerReassemble({
                defaultClass: 'default-class',
                pageContainerGutterClass: 'gutter-class',
                pageContainerDefaultClass: 'container-class',
                PageContainerHeader: () => <header>Header</header>,
                PageContainerBody: () => <div>Body</div>,
                PageContainerFooter: () => <footer>Footer</footer>,
            })}
        </div>
    );
};

export default Example;
`}</SyntaxHighlighter>
    )
}

export default Example
