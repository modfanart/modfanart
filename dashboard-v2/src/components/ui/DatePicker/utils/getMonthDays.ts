import moment from 'jalali-moment';

export function getMonthDays(month: Date): Date[][] {
    // تبدیل ورودی به ماه شمسی
    const jalaliDate = moment(month).locale('fa');
    const year = jalaliDate.format('jYYYY'); // سال شمسی
    const monthNumber = jalaliDate.format('jMM'); // شماره ماه شمسی

    // تاریخ شروع ماه شمسی
    const startOfMonthJalali = moment(`${year}-${monthNumber}-01`, 'jYYYY-jMM-jDD').locale('fa');
    
    // تاریخ پایان ماه شمسی
    const endOfMonthJalali = moment(startOfMonthJalali).endOf('jMonth');

    // یافتن روز شروع ماه
    const startOfWeek = startOfMonthJalali.clone().startOf('week'); // شروع هفته

    const weeks: Date[][] = [];
    let currentDate = startOfWeek.clone(); // شروع از اولین روز هفته

    // ایجاد هفته‌ها
    while (currentDate.isBefore(endOfMonthJalali) || currentDate.isSame(endOfMonthJalali, 'day') || currentDate.isBefore(startOfMonthJalali.clone().endOf('jMonth'))) {
        const days: Date[] = [];

        // اضافه کردن روزها به هر هفته
        for (let i = 0; i < 7; i++) {
            days.push(currentDate.clone().toDate()); // تاریخ میلادی روز

            // اضافه کردن یک روز به تاریخ
            currentDate.add(1, 'day');
        }

        weeks.push(days);
    }
console.log(weeks, 'dsfsdaf')
    // تبدیل تاریخ‌ها به میلادی
    return weeks.map(week =>
        week.map(day => moment(day).locale('fa').toDate()) // تبدیل به میلادی
    );
}
