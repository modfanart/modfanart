import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'
import type { SyntheticEvent } from 'react'

const Group = () => {
    const [checkboxList, setCheckboxList] = useState<(string)[]>([
        'انتخاب A',
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
                <Checkbox value="انتخاب A">انتخاب A</Checkbox>
                <Checkbox value="انتخاب B">انتخاب B</Checkbox>
                <Checkbox value="انتخاب C">انتخاب C</Checkbox>
            </Checkbox.Group>
        </div>
    )
}

export default Group
