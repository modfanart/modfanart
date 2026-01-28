import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'

const CustomStyle = () => {
    const [isOpen, setIsOpen] = useState(false)

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    const Footer = (
        <div className="flex w-full items-start">
            <Button block className="mx-2" onClick={() => onDrawerClose()}>
                لغو
            </Button>
            <Button
                block
                className="mx-2"
                variant="solid"
                onClick={() => onDrawerClose()}
            >
                تایید
            </Button>
        </div>
    )

    const Title = (
        <div>
            <h4 className="mb-2">عنوان کشو</h4>
            <p>تکرار کردن انسان است، بازگشت (بازگشتی) الهی است.</p>
        </div>
    )

    return (
        <div>
            <Button onClick={() => openDrawer()}>باز کردن کشو</Button>
            <Drawer
                title={Title}
                isOpen={isOpen}
                footer={Footer}
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-900"
                footerClass="!border-t-0 !p-3"
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                محتوای کشو
            </Drawer>
        </div>

    )
}

export default CustomStyle
