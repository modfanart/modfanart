function getDate(dayString: string) {
    const today = new Date()
    const year = today.getFullYear().toString()
    let month = (today.getMonth() + 1).toString()

    if (month.length === 1) {
        month = '0' + month
    }

    return dayString.replace('YEAR', year).replace('MONTH', month)
}
export const calendarData = [
    {
        id: '0',
        title: 'رویداد تمام روز',
        start: getDate('YEAR-MONTH-01'),
        eventColor: 'orange',
    },
    {
        id: '1',
        title: 'رویداد طولانی',
        start: getDate('YEAR-MONTH-07'),
        end: getDate('YEAR-MONTH-10'),
        eventColor: 'red',
    },
    {
        id: '2',
        groupId: '999',
        title: 'رویداد تکراری',
        start: getDate('YEAR-MONTH-09T16:00:00+00:00'),
        eventColor: 'blue',
    },
    {
        id: '3',
        groupId: '999',
        title: 'رویداد تکراری',
        start: getDate('YEAR-MONTH-16T16:00:00+00:00'),
        eventColor: 'blue',
    },
    {
        id: '4',
        title: 'کنفرانس',
        start: 'YEAR-MONTH-17',
        end: getDate('YEAR-MONTH-19'),
        eventColor: 'blue',
    },
    {
        id: '5',
        title: 'جلسه',
        start: getDate('YEAR-MONTH-18T10:30:00+00:00'),
        end: getDate('YEAR-MONTH-18T12:30:00+00:00'),
        eventColor: 'blue',
    },
    {
        id: '6',
        title: 'ناهار',
        start: getDate('YEAR-MONTH-18T12:00:00+00:00'),
        eventColor: 'green',
    },
    {
        id: '7',
        title: 'جشن تولد',
        start: getDate('YEAR-MONTH-19T07:00:00+00:00'),
        eventColor: 'purple',
    },
    {
        id: '8',
        title: 'جلسه',
        start: getDate('YEAR-MONTH-18T14:30:00+00:00'),
        eventColor: 'blue',
    },
    {
        id: '9',
        title: 'ساعت خوش',
        start: getDate('YEAR-MONTH-18T17:30:00+00:00'),
        eventColor: 'yellow',
    },
    {
        id: '10',
        title: 'شام',
        start: getDate('YEAR-MONTH-22T20:00:00+00:00'),
        eventColor: 'green',
    },
]


