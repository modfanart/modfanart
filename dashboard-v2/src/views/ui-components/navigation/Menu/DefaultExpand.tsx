import { useState } from 'react'
import Menu from '@/components/ui/Menu'

const DefaultExpand = () => {
    const [defaultExpandKey] = useState(['item-3'])

    return (
        <div
            className="border border-gray-200 dark:border-gray-700 rounded-md p-2"
            style={{ maxWidth: 250 }}
        >
            <Menu defaultExpandedKeys={defaultExpandKey}>
                <Menu.MenuItem eventKey="item-1">آیتم 1</Menu.MenuItem>
                <Menu.MenuItem eventKey="item-2">آیتم 2</Menu.MenuItem>
                <Menu.MenuCollapse eventKey="item-3" label="آیتم 3">
                    <Menu.MenuItem eventKey="item-3-1">آیتم 3.1</Menu.MenuItem>
                    <Menu.MenuItem eventKey="item-3-2">آیتم 3.2</Menu.MenuItem>
                </Menu.MenuCollapse>
                <Menu.MenuCollapse eventKey="item-4" label="آیتم 4">
                    <Menu.MenuItem eventKey="item-4-1">آیتم 4.1</Menu.MenuItem>
                    <Menu.MenuItem eventKey="item-4-2">آیتم 4.2</Menu.MenuItem>
                </Menu.MenuCollapse>
            </Menu>
        </div>
    )
}

export default DefaultExpand
