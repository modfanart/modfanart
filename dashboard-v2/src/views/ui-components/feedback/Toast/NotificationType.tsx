import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'

const NotificationType = () => {
    const openNotification = (
        type: 'success' | 'warning' | 'danger' | 'info',
    ) => {
        toast.push(
            <Notification
                title={translateStatusToPersian(type.charAt(0).toUpperCase() + type.slice(1))}
                type={type}
            >
                گربه چاق روی حصیر نشست و با پنجه‌ها صاحبش را اذیت کرد.
            </Notification>
        )
    }
    const translateStatusToPersian = (status: string) => {
        switch (status) {
            case "Success":
                return "موفقیت";
            case "Warning":
                return "هشدار";
            case "Danger":
                return "خطر";
            case "Info":
                return "اطلاعات";
            default:
                return "نامشخص";
        }
    };
    return (
        <div>
            <Button
                className="mr-2 mb-2"
                onClick={() => openNotification('success')}
            >
                موفقیت
            </Button>
            <Button
                className="mr-2 mb-2"
                onClick={() => openNotification('info')}
            >
                اطلاعات
            </Button>
            <Button
                className="mr-2 mb-2"
                onClick={() => openNotification('danger')}
            >
                خطر
            </Button>
            <Button
                className="mr-2 mb-2"
                onClick={() => openNotification('warning')}
            >
                هشدار
            </Button>
        </div>
    )
}

export default NotificationType
