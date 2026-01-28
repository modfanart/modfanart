import { useState } from 'react'
import Select from '@/components/ui/Select'

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
    { value: 'forest', label: 'سبز جنگلی', color: '#00875A' },
    { value: 'slate', label: 'خاکستری تیره', color: '#253858' },
    { value: 'silver', label: 'نقره‌ای', color: '#666666' },
];

const LoadOptionOnExpand = () => {
    const [options, setOptions] = useState<Option[]>([])
    const [loading, setLoading] = useState(false)

    const promiseOptions = () => {
        setTimeout(() => {
            setOptions(colourOptions)
            setLoading(false)
        }, 1500)
    }

    const onFocus = () => {
        if (options.length === 0) {
            setLoading(true)
            promiseOptions()
        }
    }

    return (
        <div>
            <Select placeholder='انتخاب کنید...' options={options} isLoading={loading} onFocus={onFocus} />
        </div>
    )
}

export default LoadOptionOnExpand
