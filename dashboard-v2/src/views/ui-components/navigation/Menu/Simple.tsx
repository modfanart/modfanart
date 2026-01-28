import Menu from '@/components/ui/Menu'

const Simple = () => {
    const handleSelect = (key: string, e: MouseEvent) => {
        console.log('key', key)
        console.log('event', e)
    }

    return (
        <div
            className="border border-gray-200 dark:border-gray-700 rounded-md p-2"
            style={{ maxWidth: 250 }}
        >
            <Menu onSelect={handleSelect}>
                <Menu.MenuItem eventKey="settings">تنظیمات</Menu.MenuItem>
                <Menu.MenuItem eventKey="message">پیام</Menu.MenuItem>
                <Menu.MenuItem eventKey="gallery">گالری</Menu.MenuItem>
            </Menu>
        </div>
    )
}

export default Simple
