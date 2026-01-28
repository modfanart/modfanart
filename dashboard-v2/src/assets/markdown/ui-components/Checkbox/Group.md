```jsx
import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'
import type { SyntheticEvent } from 'react'

const Group = () => {
    const [checkboxList, setCheckboxList] = useState<(string)[]>([
        'Selection A',
    ])

    const onCheckboxChange = (
        options: string[],
        e: SyntheticEvent,
    ) => {
        console.log('Checkbox change', options, e)
        setCheckboxList(options)
    }

    return (
        <div>
            <Checkbox.Group value={checkboxList} onChange={onCheckboxChange}>
                <Checkbox value="Selection A">Selection A </Checkbox>
                <Checkbox value="Selection B">Selection B </Checkbox>
                <Checkbox value="Selection C">Selection C </Checkbox>
            </Checkbox.Group>
        </div>
    )
}

export default Group

```
