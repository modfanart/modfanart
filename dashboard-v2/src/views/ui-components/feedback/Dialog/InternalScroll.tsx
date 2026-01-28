import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { MouseEvent } from 'react'

const InternalScroll = () => {
    const [dialogIsOpen, setIsOpen] = useState(false)

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
    }

    const onDialogOk = (e: MouseEvent) => {
        console.log('onDialogOk', e)
        setIsOpen(false)
    }

    return (
        <div>
            <Button variant="solid" onClick={() => openDialog()}>
                باز کردن
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <div className="flex flex-col h-full justify-between">
                    <h5 className="mb-4">عنوان دیالوگ</h5>
                    <div className="max-h-96 overflow-y-auto">
                        <p>
                            تنها دو نوع زبان برنامه‌نویسی وجود دارد: زبان‌هایی که مردم همیشه از
                            آنها شکایت می‌کنند و زبان‌هایی که هیچ‌کس از آنها استفاده نمی‌کند.
                            (Bjarne Stroustrup) راه رفتن روی آب و توسعه نرم‌افزار از یک
                            مشخصات آسان است اگر هر دو منجمد شوند. (Edward V Berard) هر احمقی
                            می‌تواند از کامپیوتر استفاده کند. بسیاری این کار را می‌کنند. (Ted
                            Nelson) اگر اشکال زدایی فرایند حذف اشکالات است، پس برنامه‌نویسی باید
                            فرایند وارد کردن آنها باشد. (Edsger W. Dijkstra)
                        </p>
                        <p>
                            هر احمقی می‌تواند از کامپیوتر استفاده کند. بسیاری این کار را می‌کنند.
                            (Ted Nelson) اگر خودرو همانطور که کامپیوتر توسعه می‌یافت، تکامل می‌یافت،
                            یک رولز رویس امروز باید ۱۰۰ دلار قیمت داشت، یک میلیون مایل در هر گالن
                            مصرف می‌کرد و سالی یکبار منفجر می‌شد و همه کسانی که داخلش بودند کشته
                            می‌شدند. (Robert X. Cringely) هر سیستم عاملی که در حال حاضر موجود است،
                            تقریباً برابر است... ما همه ضعیفیم. (Brian Valentine، معاون ارشد مایکروسافت
                            در مورد امنیت سیستم‌عامل‌ها، 2003) آموزش سبک برنامه‌نویسی خوب به
                            دانش‌آموزانی که قبلاً با BASIC آشنا شده‌اند عملاً غیرممکن است. آنها به
                            عنوان برنامه‌نویسان، به طور ذهنی نابود شده‌اند و دیگر امیدی به بازسازی
                            آنها نیست. (E. W. Dijkstra) گفته شده است که علوم بزرگ علمی، نمونه‌هایی از
                            غول‌ها هستند که بر دوش‌های دیگر غول‌ها ایستاده‌اند. همچنین گفته شده است
                            که صنعت نرم‌افزار نمونه‌ای از کوتوله‌ها است که بر انگشتان دیگر کوتوله‌ها
                            ایستاده‌اند. (Alan Cooper)
                        </p>
                        <p>
                            همیشه کد بنویسید طوری که فردی که در نهایت نگهداری کد شما را انجام می‌دهد،
                            یک روانی خشن باشد که می‌داند شما کجا زندگی می‌کنید. (Martin Golding)
                            هیچ زبان برنامه‌نویسی‌ای وجود ندارد – هیچ‌کدام از آنها ساختار یافته
                            نباشند – که از برنامه‌نویسان در برابر نوشتن برنامه‌های بد جلوگیری کند.
                            (Larry Flon) اگر سازندگان ساختمان‌ها همانطور که برنامه‌نویسان برنامه‌ها
                            می‌نویسند، ساختمان‌ها می‌ساختند، اولین زغالی که می‌آمد تمدن را نابود
                            می‌کرد. (Gerald Weinberg)
                        </p>
                    </div>
                    <div className="text-right mt-6">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            variant="plain"
                            onClick={onDialogClose}
                        >
                            لغو
                        </Button>
                        <Button variant="solid" onClick={onDialogOk}>
                            تأیید
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default InternalScroll
