```jsx
import { useState } from 'react'
import DatePicker from '@/components/ui/DatePicker'

const Controlled = () => {
    const [date, setDate] = (useState < Date) | (null > new Date())
    const [dateRange, setDateRange] =
        useState <
        [Date | null, Date | null] >
        [new Date(2022, 11, 1), new Date(2022, 11, 5)]
    const [dateTime, setDateTime] = (useState < Date) | (null > new Date())

    const handleDatePickerChange = (date: Date | null) => {
        console.log('Selected date', date)
        setDate(date)
    }

    const handleRangePickerChange = (date: [Date | null, Date | null]) => {
        console.log('Selected range date', date)
        setDateRange(date)
    }

    const handleDateTimeChange = (val: Date | null) => {
        console.log('Selected date time: ', val)
        setDateTime(val)
    }

    return (
        <div className="flex flex-col gap-5">
            <DatePicker
                placeholder="یک تاریخ انتخاب کنید"
                value={date}
                onChange={handleDatePickerChange}
            />
            <DatePicker.DatePickerRange
                placeholder="محدوده تاریخ را انتخاب کنید"
                value={dateRange}
                onChange={handleRangePickerChange}
            />
            <DatePicker.DateTimepicker
                placeholder="تاریخ و زمان را انتخاب کنید"
                value={dateTime}
                onChange={handleDateTimeChange}
            />
        </div>
    )
}

export default Controlled
```
