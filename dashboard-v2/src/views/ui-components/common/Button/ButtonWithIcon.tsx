import { useState } from 'react'
import Button from '@/components/ui/Button'
import { HiOutlineCog, HiOutlinePencil, HiOutlineInboxIn } from 'react-icons/hi'

const ButtonWithIcon = () => {
    const [loading, setLoading] = useState(false)

    const onClick = () => {
        setLoading(true)

        setTimeout(() => {
            setLoading(false)
        }, 3000)
    }

    return (
        <div className="flex-wrap inline-flex xl:flex items-center gap-2">
            <Button className="mr-2" icon={<HiOutlinePencil />}>
                <span>ویرایش</span>
            </Button>
            <Button className="mr-2" icon={<HiOutlineCog />}>
                <span>
                    <span>تنظیمات</span>
                </span>
            </Button>
            <Button
                className="mr-2"
                variant="solid"
                loading={loading}
                icon={<HiOutlineInboxIn />}
                onClick={onClick}
            >
                <span>با بارگذاری (برای فعال‌سازی کلیک کنید)</span>
            </Button>
        </div>
    )
}

export default ButtonWithIcon
