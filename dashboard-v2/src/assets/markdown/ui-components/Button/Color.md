```jsx
import Button from '@/components/ui/Button'
import classNames from 'classnames'
const Color = () => {
    return (
        <div className="mb-3">
            <Button
                className="mr-2"
                clickFeedback={false}
                customColorClass={({ active, unclickable }) =>
                    classNames(
                        'hover:text-gray-800 dark:hover:bg-gray-600 border-0 hover:ring-0',
                        active ? 'bg-gray-200' : 'bg-gray-100',
                        unclickable && 'opacity-50 cursor-not-allowed',
                        !active && !unclickable && 'hover:bg-gray-200',
                    )
                }
            >
                Custom style
            </Button>
        </div>
    )
}

export default Color
```
