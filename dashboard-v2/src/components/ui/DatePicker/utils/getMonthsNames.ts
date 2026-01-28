import moment from 'jalali-moment'

export function getMonthsNames(locale: string, format = 'MMM') {
    const names = []
    
    // تاریخ شروع را به فروردین ۱۴۰۳ تنظیم می‌کنیم
    let date = moment('1403/01/01', 'jYYYY/jMM/jDD')

    for (let i = 0; i < 12; i += 1) {
        names.push(date.locale('fa').format(format))
        date.add(1, 'month')  // به ماه بعدی می‌رویم
    }

    return names
}
