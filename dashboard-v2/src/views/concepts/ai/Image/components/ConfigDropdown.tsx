import { useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import type { ReactNode } from 'react'

type ConfigDropdownProps = {
    list: {
        label: string
        value: string
        image?: string
        icon?: ReactNode
        isIcon?: boolean
    }[]
    onSelect: (value: string) => void
    value: string
}

const ConfigDropdown = (props: ConfigDropdownProps) => {
    const { list = [], onSelect, value } = props

    const selectedSetting = useMemo(() => {
        return list.find((item) => item.value === value)
    }, [list, value])

    return (
        <Dropdown
            renderTitle={
                <Button size="sm" className="py-1">
                    <div className="flex gap-2 items-center">
                        {selectedSetting?.isIcon && (
                            <span className="text-xl">
                                {selectedSetting.icon}
                            </span>
                        )}
                        {!selectedSetting?.isIcon && selectedSetting?.image && (
                            <Avatar
                                src={selectedSetting.image}
                                size={28}
                                shape="round"
                            />
                        )}
                        {selectedSetting?.label}
                    </div>
                </Button>
            }
        >
            {list.map((item) => (
                <Dropdown.Item
                    key={item.value}
                    eventKey={item.value}
                    active={item.value === selectedSetting?.value}
                    onSelect={onSelect}
                >
                    {item.isIcon && (
                        <span className="text-xl">{item.icon}</span>
                    )}
                    {!item.isIcon && item.image && (
                        <Avatar src={item.image} size={28} shape="round" />
                    )}
                    <span>{item.label}</span>
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}

export default ConfigDropdown
