import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'

const Disabled = () => {
    const [selected] = useState(['A'])

    const checkboxes = [
        { value: 'A', label: 'انتخاب A', disabled: true },
        { value: 'B', label: 'انتخاب B', disabled: true },
        { value: 'C', label: 'انتخاب C', disabled: false },        
    ]

    return (
        <div>
            <div className="flex gap-3 mb-3">
                <Checkbox disabled>غیرفعال</Checkbox>
                <Checkbox defaultChecked disabled>
                    غیرفعال و انتخاب‌شده
                </Checkbox>
            </div>
            <Checkbox.Group value={selected}>
                {checkboxes.map((checkbox) => (
                    <Checkbox
                        key={checkbox.label}
                        value={checkbox.value}
                        disabled={checkbox.disabled}
                    >
                        {checkbox.label}
                    </Checkbox>
                ))}
            </Checkbox.Group>
        </div>
    )
}

export default Disabled
