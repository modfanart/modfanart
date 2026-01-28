import dayjs from 'dayjs'
import moment from 'jalali-moment'
export function formatYear(year: number, format?: string) {
    return moment(new Date((year+1), 1, 1)).locale('fa').format(format)
}
