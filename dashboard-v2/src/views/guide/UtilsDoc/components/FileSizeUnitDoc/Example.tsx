import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import fileSizeUnit from '@/utils/fileSizeUnit'

// Using SI units (default)
const sizeSI = fileSizeUnit(1500) // output: '1.5 kB'

// Using binary units
const sizeBinary = fileSizeUnit(1500, false) // output: '1.46 KiB'

// Specifying decimal places
const sizeWithDecimal = fileSizeUnit(1536000, true, 2) // output: '1.54 MB'
`}</SyntaxHighlighter>
    )
}

export default Example
