import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'

const CustomClose = () => {
    function closeNotification(key: string | Promise<string>) {
        if (typeof key !== 'string') {
            key.then((resolvedValue) => {
                toast.remove(resolvedValue)
            })
        } else {
            toast.remove(key)
        }
    }

    function openNotification() {
        const notificationKey = toast.push(
            <Notification title="پیام" duration={0}>
                <div>
                    گربه چاق روی حصیر نشست و با پنجه‌ها صاحبش را اذیت کرد.
                </div>
                <div className="text-right mt-3">
                    <Button
                        size="sm"
                        variant="solid"
                        className="ml-2"
                        onClick={() =>
                            closeNotification(
                                notificationKey as string | Promise<string>,
                            )
                        }
                    >
                        تایید
                    </Button>
                    <Button
                        size="sm"
                        onClick={() =>
                            closeNotification(
                                notificationKey as string | Promise<string>,
                            )
                        }
                    >
                        بستن
                    </Button>
                </div>
            </Notification>
            ,
        )
    }

    return<Button onClick={openNotification}>نمایش اعلان</Button>

}

export default CustomClose
