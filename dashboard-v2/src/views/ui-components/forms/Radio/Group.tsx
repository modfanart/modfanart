import { useState } from 'react'
import Radio from '@/components/ui/Radio'

const Group = () => {
    const [value, setValue] = useState('Banana')

    const onChange = (val: string) => {
        setValue(val)
    }

    return (
        <div>
            <Radio.Group value={value} onChange={onChange}>
                <Radio value={'Apple'}>سیب</Radio>
                <Radio value={'Banana'}>موز</Radio>
                <Radio value={'Cherry'}>گیلاس</Radio>
            </Radio.Group>
        </div>
    )
}

export default Group
