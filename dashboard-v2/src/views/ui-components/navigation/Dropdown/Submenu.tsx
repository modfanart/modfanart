import Dropdown from '@/components/ui/Dropdown'

const Submenu = () => {
    return (
        <Dropdown title="کلیک کنید!">
            <Dropdown.Item>آیتم 1</Dropdown.Item>
            <Dropdown.Menu title="آیتم راست 2">
                <Dropdown.Menu title="آیتم 2-1">
                    <Dropdown.Item active>آیتم 2-1-1</Dropdown.Item>
                    <Dropdown.Item>آیتم 2-1-2</Dropdown.Item>
                    <Dropdown.Item>آیتم 2-1-3</Dropdown.Item>
                </Dropdown.Menu>
                <Dropdown.Item>آیتم 2-2</Dropdown.Item>
                <Dropdown.Item>آیتم 2-3</Dropdown.Item>
            </Dropdown.Menu>
            <Dropdown.Menu title="آیتم راست 3">
                <Dropdown.Menu title="آیتم 3-1">
                    <Dropdown.Item>آیتم 3-1-1</Dropdown.Item>
                    <Dropdown.Item>آیتم 3-1-2</Dropdown.Item>
                    <Dropdown.Item>آیتم 3-1-3</Dropdown.Item>
                </Dropdown.Menu>
                <Dropdown.Item>آیتم 3-2</Dropdown.Item>
                <Dropdown.Item>آیتم 3-3</Dropdown.Item>
            </Dropdown.Menu>
            <Dropdown.Item>آیتم 4</Dropdown.Item>
        </Dropdown>
    )
}

export default Submenu
