import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import sleep from '@/utils/sleep';

const exampleFunction = async () => {
    console.log("Before sleep");
    await sleep(2000);  // Pauses execution for 2 seconds
    console.log("After sleep");
};

exampleFunction()`}</SyntaxHighlighter>
    )
}

export default Example
