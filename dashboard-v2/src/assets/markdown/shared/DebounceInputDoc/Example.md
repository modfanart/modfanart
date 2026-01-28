```jsx
import DebounceInput from '@/components/shared/DebouceInput';

function Example() {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        window.alert(e.target.value);
    };

    return (
        <DebounceInput
            placeholder="جستجو..."
            onChange={handleSearch}
            wait={1000}
        />
    );
}

export default Example
```
