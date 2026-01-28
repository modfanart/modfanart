import moment from 'jalali-moment';

type IsDisabledParams = {
    date: Date;
    minDate?: Date;
    maxDate?: Date;
    disableDate?(date: Date): boolean;
    disableOutOfMonth?: boolean;
    outOfMonth?: boolean;
    monthNumber: number
}

export default function isDisabled({
    minDate,
    maxDate,
    disableDate,
    disableOutOfMonth,
    date,
    outOfMonth,
    monthNumber
}: IsDisabledParams) {
    // تبدیل تاریخ ورودی به تاریخ شمسی
    const days = Number(moment(date).locale('fa').format('DD'))
    const monthV = Number(moment(date).locale('fa').format('MM'))

    if ( monthNumber == monthV ) {
       return false
    }else{
        return true
    }
}
