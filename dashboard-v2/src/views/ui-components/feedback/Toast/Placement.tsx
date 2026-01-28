import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'

const Placement = () => {
    const openNotification = (
        placement:
            | 'top-start'
            | 'top-center'
            | 'top-end'
            | 'bottom-start'
            | 'bottom-center'
            | 'bottom-end',
    ) => {
        toast.push(<Notification type="success" title="پیام" />, {
            placement: placement,
        })
    }

    return (
        <div className="grid md:grid-cols-3 gap-4 max-w-xl">
            <Button
                className="mb-2"
                onClick={() => openNotification('top-start')}
            >
                بالای چپ
            </Button>
            <Button
                className="mb-2"
                onClick={() => openNotification('top-center')}
            >
                بالای وسط
            </Button>
            <Button
                className="mb-2"
                onClick={() => openNotification('top-end')}
            >
                بالای راست
            </Button>
            <Button
                className="mb-2"
                onClick={() => openNotification('bottom-start')}
            >
                پایین چپ
            </Button>
            <Button
                className="mb-2"
                onClick={() => openNotification('bottom-center')}
            >
                پایین وسط
            </Button>
            <Button
                className="mb-2"
                onClick={() => openNotification('bottom-end')}
            >
                پایین راست
            </Button>
        </div>
    )
}

export default Placement
