import type { Period } from './types'

export const options: { value: Period; label: string }[] = [
    { value: 'thisMonth', label: 'ماهانه' },
    { value: 'thisWeek', label: 'هفتگی' },
    { value: 'thisYear', label: 'سالانه' },
]
