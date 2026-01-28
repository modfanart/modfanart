import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'

const Closable = () => {
    const toastNotification = (
        <Notification closable title="پیام">
            گربه چاق روی حصیر نشست و با پنجه‌ها صاحبش را اذیت کرد.
        </Notification>
    )

    function openNotification() {
        toast.push(toastNotification)
    }

    return (
        <div>
            <Button onClick={openNotification}>نمایش اعلان</Button>
        </div>
    )
}

export default Closable
