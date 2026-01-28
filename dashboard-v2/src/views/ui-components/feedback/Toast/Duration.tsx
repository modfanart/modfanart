import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'

const Duration = () => {
    function notificationNeverClose() {
        toast.push(
            <Notification closable type="success" duration={0}>
                موفقیت
            </Notification>,
        )
    }

    function closeAfter2000ms() {
        toast.push(
            <Notification closable type="success" duration={2000}>
                موفقیت
            </Notification>,
        )
    }

    return (
        <div>
            <Button className="mr-2" onClick={notificationNeverClose}>
                ماندگار
            </Button>
            <Button className="mr-2" onClick={closeAfter2000ms}>
                بستن بعد از ۲ ثانیه
            </Button>
        </div>
    )
}

export default Duration
