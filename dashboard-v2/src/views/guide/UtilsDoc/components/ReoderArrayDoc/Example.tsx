import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import reorderArray from '@/utils/reorderArray';

const myList = ['apple', 'banana', 'cherry', 'date'];
const reorderedList = reorderArray(myList, 1, 3);

// output: ['apple', 'cherry', 'date', 'banana']`}</SyntaxHighlighter>
    )
}

export default Example
