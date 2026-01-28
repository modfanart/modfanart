import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import classNames from '@/utils/classNames';

const Example = ({ primary, disabled }) => {
    return (
        <button
            className={classNames(
                'p-2 text-base',
                primary && 'bg-blue-500 text-white',
                disabled && 'bg-gray-500 cursor-not-allowed'
            )}
            disabled={disabled}
        >
            Click me
        </button>
    );
}`}</SyntaxHighlighter>
    )
}

export default Example
