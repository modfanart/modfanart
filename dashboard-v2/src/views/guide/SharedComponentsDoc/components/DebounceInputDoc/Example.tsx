import DebounceInput from '@/components/shared/DebouceInput'

function Example() {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        window.alert(e.target.value)
    }

    return (
        <DebounceInput
            placeholder="جستجو..."
            wait={1000}
            onChange={handleSearch}
        />
    )
}

export default Example
