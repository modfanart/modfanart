import { useState } from 'react'
import Calendar from '@/components/ui/Calendar'

const DisabledCertainDate = () => {
    const [value, setValue] = useState<Date | null>(null)

    const disableCertainDate = (date: Date) => {
        const banDate = [7, 15, 21]
        return banDate.includes(date.getDate())
    }

    return (
        <div className="md:w-[280px] max-w-[280px] mx-auto">
            <Calendar
                value={value}
                disableDate={disableCertainDate}
                onChange={setValue}
            />
        </div>
    )
}

export default DisabledCertainDate
