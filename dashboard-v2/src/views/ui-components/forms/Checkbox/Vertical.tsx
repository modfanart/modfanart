import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'

const Vertical = () => {
    const [checkboxList] = useState(['انتخاب A'])

    return (
        <div>
            <div className="flex flex-col mb-5">
                <Checkbox className="mb-2">چک باکس 1</Checkbox>
                <Checkbox>چک باکس 2</Checkbox>
            </div>
            <Checkbox.Group vertical value={checkboxList}>
                <Checkbox value="Selection A">انتخاب A</Checkbox>
                <Checkbox value="Selection B">انتخاب B</Checkbox>
                <Checkbox value="Selection C">انتخاب C</Checkbox>
            </Checkbox.Group>
        </div>
    )
}

export default Vertical
