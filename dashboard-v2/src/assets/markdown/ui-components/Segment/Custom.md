```jsx
import classNames from 'classnames'
import Segment from '@/components/ui/Segment'
import { HiCheckCircle } from 'react-icons/hi'

const segmentSelections = [
    { value: 'Personal', desc: 'The plan for personal.', disabled: false },
    { value: 'Team', desc: 'The plan for team', disabled: false },
    {
        value: 'Business',
        desc: 'Talk to us for business plan.',
        disabled: true,
    },
]

const Custom = () => {
    return (
        <Segment
            defaultValue={['Team']}
            className="gap-4 md:flex-row flex-col bg-transparent dark:bg-transparent"
        >
            {segmentSelections.map((item) => (
                <Segment.Item
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                >
                    {({ active, value, onSegmentItemClick, disabled }) => {
                        return (
                            <div
                                className={classNames(
                                    'flex',
                                    'ring-1',
                                    'justify-between',
                                    'border',
                                    'rounded-xl ',
                                    'dark:bg-transparent',
                                    'border-gray-300',
                                    'dark:border-gray-600',
                                    'py-5 px-4',
                                    'select-none',
                                    'w-100',
                                    'md:w-[260px]',
                                    active
                                        ? 'ring-primary border-primary '
                                        : 'ring-transparent bg-gray-100',
                                    disabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:ring-primary hover:border-primary cursor-pointer',
                                )}
                                onClick={onSegmentItemClick}
                                role="button"
                            >
                                <div>
                                    <h6>{value}</h6>
                                    <p>{item.desc}</p>
                                </div>
                                {active && (
                                    <HiCheckCircle className="text-primary text-xl" />
                                )}
                            </div>
                        )
                    }}
                </Segment.Item>
            ))}
        </Segment>
    )
}

export default Custom
```
