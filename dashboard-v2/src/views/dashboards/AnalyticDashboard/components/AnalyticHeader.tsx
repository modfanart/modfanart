/* eslint-disable react-refresh/only-export-components */
import Select from '@/components/ui/Select'
import type { Period } from '../types'

type AnalyticHeaderProps = {
    selectedPeriod: Period
    onSelectedPeriodChange: (value: Period) => void
}

export const options: { value: Period; label: string }[] = [
    { value: 'thisMonth', label: 'ماهانه' },
    { value: 'thisWeek', label: 'هفتگی' },
    { value: 'thisYear', label: 'سالانه' },
]


const AnalyticHeader = ({
    selectedPeriod,
    onSelectedPeriodChange,
}: AnalyticHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
            <div>
                <h4 className="mb-1">بررسی اجمالی تحلیلی</h4>
                <p>برای درک روندها و انگیزه، معیارها را کاوش کنید.</p>
            </div>
            <div className="flex items-center gap-2">
                <span>نمایش توسط:</span>
                <Select
                    className="w-[150px]"
                    size="sm"
                    placeholder="Select period"
                    value={options.filter(
                        (option) => option.value === selectedPeriod,
                    )}
                    options={options}
                    isSearchable={false}
                    onChange={(option) => {
                        if (option?.value) {
                            onSelectedPeriodChange(option?.value)
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default AnalyticHeader
