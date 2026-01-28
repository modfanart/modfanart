import Dropdown from '@/components/ui/Dropdown'
import { Link } from 'react-router-dom'

const WithRouterLink = () => {
    return (
        <div>
            <Dropdown title="کلیک کنید!">
                <Dropdown.Item>
                    <Link
                        className="menu-item-link"
                        to="/ui-components/checkbox"
                    >
                        چک‌باکس
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                    <Link className="menu-item-link" to="/ui-components/button">
                        دکمه
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                    <Link className="menu-item-link" to="/ui-components/alert">
                        هشدار
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                    <Link className="menu-item-link" to="/ui-components/dialog">
                        دیالوگ
                    </Link>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default WithRouterLink
