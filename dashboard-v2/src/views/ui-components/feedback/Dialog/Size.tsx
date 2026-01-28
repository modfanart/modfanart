import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { MouseEvent } from 'react'

const Size = () => {
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
                دیالوگ با اندازه سفارشی
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                width={1000}
                height={250}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <div className="flex flex-col h-full justify-between">
                    <h5 className="mb-4">عنوان دیالوگ</h5>
                    <p>
                        نسخه‌های مختلفی از متون لورم ایپسوم موجود است، اما بیشتر آنها دستخوش
                        تغییرات در برخی از فرم‌ها شده‌اند، توسط شوخی‌های تزریق شده یا کلمات
                        تصادفی که حتی به طور کمی باورپذیر به نظر نمی‌رسند.
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
                </div>
            </Dialog>
        </div>
    )
}

export default Size
