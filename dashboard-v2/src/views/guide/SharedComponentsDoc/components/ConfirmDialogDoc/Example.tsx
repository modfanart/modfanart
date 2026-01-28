import { useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Radio from '@/components/ui/Radio'
import Button from '@/components/ui/Button'

type DialogTypeKey = 'Info' | 'Success' | 'Warning' | 'Danger'

type DialogType = Record<
    DialogTypeKey,
    {
        type: 'info' | 'success' | 'warning' | 'danger'
        title: string
        children: string
        cancelText: string
        confirmText: string
    }
>

const dialogType: DialogType = {
    Info: {
        type: 'info',
        title: 'توجه داشته باشید',
        children: 'فقط برخی اطلاعات برای شما!',
        cancelText: 'لغو',
        confirmText: 'باشه',
    },
    Success: {
        type: 'success',
        title: 'تمام شد!',
        children: 'فقط یک پیام موفقیت برای شما!',
        cancelText: 'لغو',
        confirmText: 'همه چیز خوب است',
    },
    Warning: {
        type: 'warning',
        title: 'هشدار',
        children: 'فقط یک پیام هشدار برای شما!',
        cancelText: 'لغو',
        confirmText: 'فهمیدم',
    },
    Danger: {
        type: 'danger',
        title: 'حذف',
        children: 'آیا از حذف اطمینان دارید؟',
        cancelText: 'لغو',
        confirmText: 'حذف',
    },
}


const Example = () => {
    const [selected, setSelected] = useState<DialogTypeKey>(
        Object.keys(dialogType)[0] as DialogTypeKey,
    )
    const [open, setOpen] = useState(false)

    const handleClose = () => {
        console.log('Close')
        setOpen(false)
    }

    const handleConfirm = () => {
        console.log('Confirm')
        setOpen(false)
    }

    const translateMessage = (message: string): string => {
        switch (message) {
            case 'Info':
                return 'اطلاعات';
            case 'Success':
                return 'موفقیت';
            case 'Warning':
                return 'هشدار';
            case 'Danger':
                return 'خطر';
            default:
                return '';
        }
    };
    return (
        <div className="flex flex-col gap-6">
            <Radio.Group value={selected} onChange={(val) => setSelected(val)}>
                {Object.keys(dialogType).map((value) => {
                    return (
                        <Radio key={value} value={value}>
                            {translateMessage(value)}
                        </Radio>
                    )
                })}
            </Radio.Group>
            <div>
                <Button onClick={() => setOpen(true)}>راه‌اندازی</Button>
            </div>
            <ConfirmDialog
                isOpen={open}
                type={dialogType[selected].type}
                title={dialogType[selected].title}
                onClose={handleClose}
                onRequestClose={handleClose}
                onCancel={handleClose}
                onConfirm={handleConfirm}
            >
                <p>{dialogType[selected].children}</p>
            </ConfirmDialog>
        </div>
    )
}

export default Example
