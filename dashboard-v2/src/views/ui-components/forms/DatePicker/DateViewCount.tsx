import DatePicker from '@/components/ui/DatePicker'

const { DatePickerRange } = DatePicker

const DateViewCount = () => {
    return (
        <DatePickerRange dateViewCount={2} placeholder="نمایش تاریخ چندگانه" />
    )
}

export default DateViewCount
