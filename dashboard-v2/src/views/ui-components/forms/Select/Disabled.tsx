import Select from '@/components/ui/Select'

const colourOptions = [
    { value: 'ocean', label: 'اقیانوس', color: '#00B8D9', isDisabled: true },
    { value: 'blue', label: 'آبی', color: '#0052CC', isDisabled: true },
    { value: 'purple', label: 'بنفش', color: '#5243AA' },
    { value: 'red', label: 'قرمز', color: '#FF5630', isDisabled: true },
    { value: 'orange', label: 'نارنجی', color: '#FF8B00' },
    { value: 'yellow', label: 'زرد', color: '#FFC400' },
    { value: 'green', label: 'سبز', color: '#36B37E' },
    { value: 'forest', label: 'سبز جنگلی', color: '#00875A', isDisabled: true },
    { value: 'slate', label: 'خاکستری تیره', color: '#253858', isDisabled: true },
    { value: 'silver', label: 'نقره‌ای', color: '#666666' },
];

const Disabled = () => {
    return (
        <div>
            <Select
                className="mb-4"
                placeholder="برخی گزینه‌ها غیرفعال هستند"
                options={colourOptions}
            />
            <Select
                isDisabled
                className="mb-4"
                placeholder="لطفاً انتخاب کنید"
                defaultValue={colourOptions[2]}
                options={colourOptions}
            />
            <Select
                isDisabled
                isMulti
                defaultValue={[colourOptions[2], colourOptions[3]]}
                options={colourOptions}
            />
        </div>
    )
}

export default Disabled
