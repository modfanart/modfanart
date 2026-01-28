import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { MouseEvent } from 'react'

const StaticBackdrop = () => {
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
                باز کردن دیالوگ
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                bodyOpenClassName="overflow-hidden"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">عنوان دیالوگ</h5>
                <p>
                    نسخه‌های مختلفی از متون لورم ایپسوم موجود است، اما بیشتر آنها دستخوش تغییرات
                    در برخی از فرم‌ها شده‌اند، توسط شوخی‌های تزریق شده یا کلمات تصادفی که حتی
                    به طور کمی باورپذیر به نظر نمی‌رسند.
                </p>
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
            </Dialog>
        </div>
    )
}

export default StaticBackdrop
