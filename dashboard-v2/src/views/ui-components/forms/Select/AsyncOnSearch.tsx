import { useState } from 'react'
import Select from '@/components/ui/Select'
import AsyncSelect from 'react-select/async'

type Option = {
    value: string
    label: string
    color: string
    isFixed?: boolean
    isDisabled?: boolean
}

const colourOptions: Option[] = [
    { value: 'ocean', label: 'اقیانوس', color: '#00B8D9', isFixed: true },
    { value: 'blue', label: 'آبی', color: '#0052CC', isDisabled: true },
    { value: 'purple', label: 'بنفش', color: '#5243AA' },
    { value: 'red', label: 'قرمز', color: '#FF5630', isFixed: true },
    { value: 'orange', label: 'نارنجی', color: '#FF8B00' },
    { value: 'yellow', label: 'زرد', color: '#FFC400' },
    { value: 'green', label: 'سبز', color: '#36B37E' },
    { value: 'forest', label: 'جنگلی', color: '#00875A' },
    { value: 'slate', label: 'سنگی', color: '#253858' },
    { value: 'silver', label: 'نقره‌ای', color: '#666666' },
]


const filterColors = (inputValue: string) => {
    return colourOptions.filter((i) =>
        i.label.toLowerCase().includes(inputValue.toLowerCase()),
    )
}

const loadOptions = (
    inputValue: string,
    callback: (options: Option[]) => void,
) => {
    setTimeout(() => {
        const filteredOptions = filterColors(inputValue)
        callback(filteredOptions)
    }, 1000)
}

const AsyncOnSearch = () => {
    const [_, setValue] = useState('')

    const handleInputChange = (newValue: string) => {
        const inputValue = newValue.replace(/\W/g, '')
        setValue(inputValue)
        return inputValue
    }

    console.log(_)

    return (
        <div>
            <Select
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                componentAs={AsyncSelect}
                onInputChange={handleInputChange}
                placeholder='انتخاب کنید...'
            />
        </div>
    )
}

export default AsyncOnSearch
