import Menu from '@/components/ui/Menu'

const DisabledMenuItem = () => {
    return (
        <div
            className="border border-gray-200 dark:border-gray-700 rounded-md p-2"
            style={{ maxWidth: 250 }}
        >
            <Menu>
                <Menu.MenuItem eventKey="settings">تنظیمات</Menu.MenuItem>
                <Menu.MenuItem disabled eventKey="message">
                    پیام
                </Menu.MenuItem>
                <Menu.MenuItem eventKey="gallery">گالری</Menu.MenuItem>
            </Menu>
        </div>
    )
}

export default DisabledMenuItem
