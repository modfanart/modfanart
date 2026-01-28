import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import Avatar from '@/components/ui/Avatar'
import { HiOutlineGift } from 'react-icons/hi'

const CustomIcon = () => {
    const notificationWithIcon = (
        <Notification
            title="شما یک هدیه دریافت کردید!"
            customIcon={<HiOutlineGift className="text-2xl text-indigo-600" />}
        >
            چیزی که ممکن است دوست داشته باشید.
        </Notification>
    )

    const notificationWithAvatar = (
        <Notification
            title="امیلی گیل"
            customIcon={
                <Avatar shape="circle" src="/img/avatars/thumb-1.jpg" />
            }
        >
           برای شما درخواست دوستی ارسال کرد.
        </Notification>
    )

    function openNotification(type: string) {
        toast.push(
            type === 'icon' ? notificationWithIcon : notificationWithAvatar,
        )
    }

    return (
        <div>
            <Button className="ml-2" onClick={() => openNotification('icon')}>
                آیکون سفارشی
            </Button>
            <Button onClick={() => openNotification('avatar')}>آواتار</Button>
        </div>
    )
}

export default CustomIcon
