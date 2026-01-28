import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import useRandomBgColor from '@/utils/hooks/useRandomBgColor';

const Example = ({ name }: { name: string }) => {
    const getBgColor = useRandomBgColor();

    return (
        <div className={getBgColor(name)}>
            {name}
        </div>
    );
};

export default Example
`}</SyntaxHighlighter>
    )
}

export default Example
