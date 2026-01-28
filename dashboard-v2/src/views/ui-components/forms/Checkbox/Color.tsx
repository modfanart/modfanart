import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'

const Color = () => {
    const [checkboxList] = useState(['A', 'B', 'C'])

    return (
        <div>
            <div className="mb-5">
                <Checkbox checked checkboxClass="text-green-500">
                    چک‌باکس 1
                </Checkbox>
            </div>
            <Checkbox.Group checkboxClass="text-yellow-500" value={checkboxList}>
                <Checkbox checkboxClass="text-indigo-600" value="A">
                    انتخاب A
                </Checkbox>
                <Checkbox value="B">انتخاب B</Checkbox>
                <Checkbox value="C">انتخاب C</Checkbox>
            </Checkbox.Group>
        </div>
    )
}

export default Color
