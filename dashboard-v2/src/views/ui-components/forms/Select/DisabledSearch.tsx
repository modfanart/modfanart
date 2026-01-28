import Select from '@/components/ui/Select'

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


const DisabledSearch = () => {
    return (
        <div>
            <Select
                isSearchable={false}
                placeholder="لطفا انتخاب کنید"
                options={colourOptions}
            />
        </div>
    )
}

export default DisabledSearch
