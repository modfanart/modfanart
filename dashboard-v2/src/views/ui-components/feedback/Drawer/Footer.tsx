import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'

const Footer = () => {
    const [isOpen, setIsOpen] = useState(false)

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    const Footer = (
        <div className="text-right w-full">
            <Button size="sm" className="ml-2" onClick={() => onDrawerClose()}>
                لغو
            </Button>
            <Button size="sm" variant="solid" onClick={() => onDrawerClose()}>
                تایید
            </Button>
        </div>
    )

    return (
        <div>
            <Button variant="solid" onClick={() => openDrawer()}>
                باز کردن کشو
            </Button>
            <Drawer
                title="عنوان کشو"
                isOpen={isOpen}
                footer={Footer}
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                محتوای کشو
            </Drawer>
        </div>
    )
}

export default Footer
