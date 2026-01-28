import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import cookiesStorage from '@/utils/cookiesStorage';

// Set a cookie
cookiesStorage.setItem('userToken', 'abc123', 7); // expires in 7 days

// Get a cookie
const userToken = cookiesStorage.getItem('userToken')

// Remove a cookie
cookiesStorage.removeItem('userToken')`}</SyntaxHighlighter>
    )
}

export default Example
