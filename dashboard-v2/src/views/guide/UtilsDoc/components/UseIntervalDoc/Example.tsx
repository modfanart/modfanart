import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import useInterval from '@/utils/hooks/useInterval'

const Example = () => {
    const [count, setCount] = useState(0)

    useInterval(() => {
        setCount((prevCount) => prevCount + 1)
    }, 1000)

    return <div>Count: {count}</div>;
};

export default Example
`}</SyntaxHighlighter>
    )
}

export default Example
