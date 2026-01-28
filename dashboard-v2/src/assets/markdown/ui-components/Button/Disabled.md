```jsx
import Button from '@/components/ui/Button'

const Disabled = () => {
    return (
        <div className="flex items-center gap-2">
            <Button disabled variant="default">
                Default
            </Button>
            <Button disabled variant="solid">
                Solid
            </Button>
            <Button disabled variant="plain">
                Plain
            </Button>
        </div>
    )
}

export default Disabled
```
