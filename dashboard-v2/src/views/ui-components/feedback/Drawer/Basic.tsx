import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import type { MouseEvent } from 'react'

const Basic = () => {
    const [isOpen, setIsOpen] = useState(false)

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = (e: MouseEvent) => {
        console.log('onDrawerClose', e)
        setIsOpen(false)
    }

    return (
        <div>
            <Button onClick={() => openDrawer()}>باز کردن کشو</Button>
            <Drawer
                title="عنوان کشو"
                isOpen={isOpen}
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                محتوای کشو
            </Drawer>
        </div>
    )
}

export default Basic
