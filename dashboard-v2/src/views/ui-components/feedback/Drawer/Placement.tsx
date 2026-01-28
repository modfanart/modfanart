import { useState } from 'react'
import Button from '@/components/ui/Button'
import Radio from '@/components/ui/Radio'
import Drawer from '@/components/ui/Drawer'
import type { MouseEvent } from 'react'

type Direction = 'top' | 'right' | 'bottom' | 'left'

const placementList: {
    name: string
    value: Direction
}[] = [
        { name: 'بالا', value: 'top' },
        { name: 'راست', value: 'right' },
        { name: 'پایین', value: 'bottom' },
        { name: 'چپ', value: 'left' },
    ]

const Placement = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [placement, setPlacement] = useState<Direction>(
        placementList[1].value,
    )

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = (e: MouseEvent) => {
        console.log('onDrawerClose', e)
        setIsOpen(false)
    }

    const onPlacementChange = (val: Direction) => {
        setPlacement(val)
    }

    return (
        <div className="flex-wrap inline-flex xl:flex items-center gap-2">
            <Radio.Group value={placement} onChange={onPlacementChange}>
                {placementList.map((item) => (
                    <Radio key={item.value} value={item.value} id={item.value}>
                        {item.name}
                    </Radio>
                ))}
            </Radio.Group>
            <Button onClick={() => openDrawer()}>باز کردن کشو</Button>
            <Drawer
                title="عنوان کشو"
                isOpen={isOpen}
                placement={placement}
                onClose={onDrawerClose}
                onRequestClose={onDrawerClose}
            >
                محتوای کشو
            </Drawer>
        </div>
    )
}

export default Placement
