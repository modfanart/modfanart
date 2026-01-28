import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar/Avatar'
import Notification from '@/components/ui/Notification'
import Tooltip from '@/components/ui/Tooltip'
import toast from '@/components/ui/toast'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import dayjs from 'dayjs'
import { HiPencil, HiOutlineTrash } from 'react-icons/hi'
import {
    FaXTwitter,
    FaFacebookF,
    FaLinkedinIn,
    FaPinterestP,
} from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import moment from 'jalali-moment'

type CustomerInfoFieldProps = {
    title?: string
    value?: string
}

type ProfileSectionProps = {
    data: Partial<{
        id: string
        img: string
        name: string
        email: string
        lastOnline: number
        personalInfo: {
            location: string
            title: string
            birthday: string
            phoneNumber: string
            facebook: string
            twitter: string
            pinterest: string
            linkedIn: string
        }
    }>
}

const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
    return (
        <div>
            <span className="font-semibold">{title}</span>
            <p className="heading-text font-bold">{value}</p>
        </div>
    )
}

const ProfileSection = ({ data = {} }: ProfileSectionProps) => {
    const navigate = useNavigate()

    const [dialogOpen, setDialogOpen] = useState(false)

    const handleSocialNavigate = (link: string = '') => {
        window.open(`https://${link}`, '_blank', 'rel=noopener noreferrer')
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    const handleDialogOpen = () => {
        setDialogOpen(true)
    }

    const handleDelete = () => {
        setDialogOpen(false)
        navigate('/concepts/customers/customer-list')
        toast.push(
            <Notification title={'حذف با موفقیت انجام شد'} type="success">
                مشتری با موفقیت حذف شد
            </Notification>
        )
    }

    const handleSendMessage = () => {
        navigate('/concepts/chat')
    }

    const handleEdit = () => {
        navigate(`/concepts/customers/customer-edit/${data.id}`)
    }

    return (
        <Card className="w-full">
            <div className="flex justify-end">
                <Tooltip title="ویرایش مشتری">
                    <button
                        className="close-button button-press-feedback"
                        type="button"
                        onClick={handleEdit}
                    >
                        <HiPencil />
                    </button>
                </Tooltip>
            </div>
            <div className="flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto">
                <div className="flex xl:flex-col items-center gap-4 mt-6">
                    <Avatar size={90} shape="circle" src={data.img} />
                    <h4 className="font-bold">{data.name}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-10">
                    <CustomerInfoField title="ایمیل" value={data.email} />
                    <CustomerInfoField
                        title="تلفن"
                        value={data.personalInfo?.phoneNumber}
                    />
                    <CustomerInfoField
                        title="تاریخ تولد"
                        value={data.personalInfo?.birthday}
                    />
                    <CustomerInfoField
                        title="آخرین حضور آنلاین"
                        value={moment
                            .unix(data.lastOnline as number).locale('fa')
                            .format('DD MMM YYYY hh:mm A')}
                    />
                    <div className="mb-7">
                        <span>شبکه‌های اجتماعی</span>
                        <div className="flex mt-4 gap-2">
                            <Button
                                size="sm"
                                icon={<FaFacebookF className="text-[#2259f2]" />}
                                onClick={() =>
                                    handleSocialNavigate(data.personalInfo?.facebook)
                                }
                            />
                            <Button
                                size="sm"
                                icon={<FaXTwitter className="text-black dark:text-white" />}
                                onClick={() =>
                                    handleSocialNavigate(data.personalInfo?.twitter)
                                }
                            />
                            <Button
                                size="sm"
                                icon={<FaLinkedinIn className="text-[#155fb8]" />}
                                onClick={() =>
                                    handleSocialNavigate(data.personalInfo?.linkedIn)
                                }
                            />
                            <Button
                                size="sm"
                                icon={<FaPinterestP className="text-[#df0018]" />}
                                onClick={() =>
                                    handleSocialNavigate(data.personalInfo?.pinterest)
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Button block variant="solid" onClick={handleSendMessage}>
                        ارسال پیام
                    </Button>
                    <Button
                        block
                        customColorClass={() =>
                            'text-error hover:border-error hover:ring-1 ring-error hover:text-error'
                        }
                        icon={<HiOutlineTrash />}
                        onClick={handleDialogOpen}
                    >
                        حذف
                    </Button>
                </div>
                <ConfirmDialog
                    isOpen={dialogOpen}
                    type="danger"
                    title="حذف مشتری"
                    onClose={handleDialogClose}
                    onRequestClose={handleDialogClose}
                    onCancel={handleDialogClose}
                    onConfirm={handleDelete}
                >
                    <p>
                        آیا از حذف این مشتری اطمینان دارید؟ تمامی سوابق مربوط به این
                        مشتری نیز حذف خواهد شد. این عمل قابل بازگشت نیست.
                    </p>
                </ConfirmDialog>
            </div>
        </Card>

    )
}

export default ProfileSection
