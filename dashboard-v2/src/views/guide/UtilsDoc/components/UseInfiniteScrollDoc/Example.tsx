import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import useInfiniteScroll from '@/utils/hooks/useInfiniteScroll';

const InfiniteScrollComponent = () => {
    const [items, setItems] = useState([...Array(20).keys()]);

    const loadMoreItems = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setItems((prevItems) => [...prevItems, ...Array(20).keys()]);
    };

    const { isLoading, containerRef } = useInfiniteScroll({
        onLoadMore: loadMoreItems,
    });

    return (
        <div ref={containerRef} style={{ height: '300px', overflowY: 'auto' }}>
            {items.map((item, index) => (
                <div key={index} style={{ padding: '10px', border: '1px solid #ddd' }}>
                    Item {index + 1}
                </div>
            ))}
            {isLoading && <p>Loading more items...</p>}
        </div>
    );
};

export default InfiniteScrollComponent;
`}</SyntaxHighlighter>
    )
}

export default Example
