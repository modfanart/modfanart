import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import reorderDragable from '@/utils/reorderDragable';

const quoteMap = {
    list1: ['item1', 'item2', 'item3'],
    list2: ['item4', 'item5'],
};

const source = { droppableId: 'list1', index: 1 };  // Moving item2
const destination = { droppableId: 'list2', index: 1 };  // To position 1 in list2

const result = reorderDragable({ quoteMap, source, destination });

// output:
// {
//   quoteMap: {
//     list1: ['item1', 'item3'],
//     list2: ['item4', 'item2', 'item5'],
//   }
// }
`}</SyntaxHighlighter>
    )
}

export default Example
