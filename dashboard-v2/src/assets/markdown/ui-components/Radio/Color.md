```jsx
import Radio from '@/components/ui/Radio'

const Color = () => {
    return (
        <div>
            <Radio defaultChecked radioClass="text-green-500">
                Radio
            </Radio>
            <div className="mt-4">
                <Radio.Group
                    radioClass="text-yellow-500"
                    value={'Apple'}
                    name="radioColorGroup"
                >
                    <Radio radioClass="text-blue-600" value={'Apple'}>
                        Apple
                    </Radio>
                    <Radio value={'Banana'}>Banana</Radio>
                    <Radio value={'Cherry'}>Cherry</Radio>
                </Radio.Group>
            </div>
        </div>
    )
}

export default Color
```
