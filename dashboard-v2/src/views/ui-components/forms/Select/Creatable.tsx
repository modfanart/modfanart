import Select from '@/components/ui/Select'
import CreatableSelect from 'react-select/creatable'
import type { InputActionMeta, ActionMeta } from 'react-select'

type Option = {
    value: string
    label: string
    color: string
}

const colourOptions = [
    { value: 'ocean', label: 'اقیانوس', color: '#00B8D9' },
    { value: 'blue', label: 'آبی', color: '#0052CC' },
    { value: 'purple', label: 'بنفش', color: '#5243AA' },
    { value: 'red', label: 'قرمز', color: '#FF5630' },
    { value: 'orange', label: 'نارنجی', color: '#FF8B00' },
    { value: 'yellow', label: 'زرد', color: '#FFC400' },
    { value: 'green', label: 'سبز', color: '#36B37E' },
    { value: 'forest', label: 'سبز جنگلی', color: '#00875A' },
    { value: 'slate', label: 'خاکستری تیره', color: '#253858' },
    { value: 'silver', label: 'نقره‌ای', color: '#666666' },
];


const Creatable = () => {
    const handleChange = (
        newValue: Option | Option[] | null,
        actionMeta: ActionMeta<Option>,
    ) => {
        console.group('Value Changed')
        console.log(newValue)
        console.log(`action: ${actionMeta.action}`)
        console.groupEnd()
    }

    const handleInputChange = (
        inputValue: string,
        actionMeta: InputActionMeta,
    ) => {
        console.group('Input Changed')
        console.log(inputValue)
        console.log(`action: ${actionMeta.action}`)
        console.groupEnd()
    }

    return (
        <div>
            <Select<Option>
                isClearable
                placeholder="چیزی تایپ کن..."
                componentAs={CreatableSelect}
                options={colourOptions}
                onChange={handleChange}
                onInputChange={handleInputChange}
            />
        </div>
    )
}

export default Creatable
