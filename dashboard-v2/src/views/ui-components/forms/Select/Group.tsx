import Select from '@/components/ui/Select'

type Option = {
    label: string
    options: {
        value: string
        label: string
        color?: string
        rating?: string
    }[]
}

const groupedOptions: Option[] = [
    {
        label: 'رنگ‌ها',
        options: [
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
        ],
    },
    {
        label: 'طعم‌ها',
        options: [
            { value: 'vanilla', label: 'وانیل', rating: 'مطمئن' },
            { value: 'chocolate', label: 'شکلات', rating: 'خوب' },
            { value: 'strawberry', label: 'توت‌فرنگی', rating: 'جسور' },
            {
                value: 'salted-caramel',
                label: 'کارامل نمکی',
                rating: 'خیلی خاص',
            },
        ],
    },
];


const formatGroupLabel = (data: Option) => (
    <div className="font-bold text-xs uppercase text-gray-800 dark:text-white my-2">
        {data.label}
    </div>
)

const Group = () => {
    return (
        <div>
            <Select
                defaultValue={groupedOptions[0].options[1]}
                options={groupedOptions}
                formatGroupLabel={formatGroupLabel}
            />
        </div>
    )
}

export default Group
