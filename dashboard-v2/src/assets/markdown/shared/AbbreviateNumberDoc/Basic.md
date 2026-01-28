```jsx
import AbbreviateNumber from '@/components/shared/AbbreviateNumber'

const Basic = () => {
    return (
        <div>
            <div className="mb-2">
                <AbbreviateNumber value={1200000} /> as (1200000)
            </div>
            <div className="mb-2">
                <AbbreviateNumber value={2100} /> as (2100)
            </div>
        </div>
    )
}

export default Basic
```
