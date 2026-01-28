import { getStartOfWeek } from './getStartOfWeek'
import type { FirstDayOfWeek } from '../../@types/date'
import moment from 'jalali-moment'

export function getWeekdaysNames(
    locale: string,
    firstDayOfWeek: FirstDayOfWeek = 'saturday', // شروع از شنبه
    format = 'dd',
) {
    const names = []
    let date = getStartOfWeek(new Date(), firstDayOfWeek)

    // اینجا فرض می‌کنیم که روز هفته باید به ترتیب شنبه تا جمعه باشد
    const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

    // در صورتی که به ترتیب صحیح نیامده باشد، باید روزهای هفته را مرتب کنیم
    for (let i = 0; i < 7; i += 1) {
        names.push(weekdays[i])  // استفاده از آرایه‌ی روزهای هفته به ترتیب صحیح
        date.setDate(date.getDate() + 1)
    }

    return names
}
