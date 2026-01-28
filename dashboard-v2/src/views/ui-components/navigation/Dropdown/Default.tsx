import Dropdown from '@/components/ui/Dropdown'
import type { SyntheticEvent } from 'react'

const Default = () => {
    const dropdownItems = [
        { key: 'a', name: 'آیتم A' },
        { key: 'b', name: 'آیتم B' },
        { key: 'c', name: 'آیتم C' },
        { key: 'd', name: 'آیتم D' },
    ]

    const onDropdownItemClick = (eventKey: string, e: SyntheticEvent) => {
        console.log('آیتم منوی کشویی کلیک شد', eventKey, e)
    }

    const onDropdownClick = (e: SyntheticEvent) => {
        console.log('منوی کشویی کلیک شد', e)
    }

    return (
        <div>
            <Dropdown title="کلیک کن!" onClick={onDropdownClick}>
                {dropdownItems.map((item) => (
                    <Dropdown.Item
                        key={item.key}
                        eventKey={item.key}
                        onSelect={onDropdownItemClick}
                    >
                        {item.name}
                    </Dropdown.Item>
                ))}
            </Dropdown>
        </div>
    )
}


export default Default
