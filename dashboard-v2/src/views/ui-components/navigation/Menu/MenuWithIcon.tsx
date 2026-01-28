import Menu from '@/components/ui/Menu'
import {
    HiOutlineCog,
    HiOutlineChat,
    HiOutlineGlobeAlt,
    HiOutlineSupport,
    HiWifi,
} from 'react-icons/hi'
import type { ReactNode } from 'react'

const MenuContent = ({ icon, label }: { icon: ReactNode; label: string }) => {
    return (
        <div className="flex items-center gap-2">
            <span className={'text-2xl'}>{icon}</span>
            <span>{label}</span>
        </div>
    )
}

const MenuWithIcon = () => {
    return (
        <div
            className="border border-gray-200 dark:border-gray-700 rounded-md p-2"
            style={{ maxWidth: 250 }}
        >
            <Menu>
                <Menu.MenuItem eventKey="settings">
                    <MenuContent icon={<HiOutlineCog />} label="تنظیمات" />
                </Menu.MenuItem>
                <Menu.MenuItem eventKey="messages">
                    <MenuContent icon={<HiOutlineChat />} label="پیام‌ها" />
                </Menu.MenuItem>
                <Menu.MenuCollapse
                    eventKey="others"
                    label={
                        <MenuContent
                            icon={<HiOutlineGlobeAlt />}
                            label="شبکه"
                        />
                    }
                >
                    <Menu.MenuItem eventKey="wifi">
                        <MenuContent icon={<HiWifi />} label="وای‌فای" />
                    </Menu.MenuItem>
                    <Menu.MenuItem eventKey="support">
                        <MenuContent
                            icon={<HiOutlineSupport />}
                            label="پشتیبانی"
                        />
                    </Menu.MenuItem>
                </Menu.MenuCollapse>
            </Menu>
        </div>
    )
}

export default MenuWithIcon
