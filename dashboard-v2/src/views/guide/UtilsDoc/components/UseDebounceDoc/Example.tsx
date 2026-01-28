import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Example = () => {
    return (
        <SyntaxHighlighter language="js">{`import { useState, useCallback } from 'react'
import Input from '@/components/ui/Input'
import useDebounce from '@/utils/hooks/useDebounce'
import type { ChangeEvent } from 'react'

const Example = () => {
    const [query, setQuery] = useState('')

    const handleSearch = (input: string) => {
        console.log('Searching for:', input)
    };

    const debouncedSearch = useDebounce(handleSearch, 300);

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setQuery(value)
        debouncedSearch(value)
    }, [debouncedSearch])

    return (
        <Input 
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="جستجو..."
        />
    );
};

export default Example
`}</SyntaxHighlighter>
    )
}

export default Example
