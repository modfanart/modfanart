import Dropdown from '@/components/ui/Dropdown'

const Disabled = () => {
    return (
        <div>
            <Dropdown disabled title="کلیک کن!">
                <Dropdown.Item>آیتم A</Dropdown.Item>
                <Dropdown.Item>آیتم B</Dropdown.Item>
                <Dropdown.Item>آیتم C</Dropdown.Item>
                <Dropdown.Item>آیتم D</Dropdown.Item>
            </Dropdown>
            <Dropdown title="کلیک کن!">
                <Dropdown.Item>آیتم A</Dropdown.Item>
                <Dropdown.Item disabled>آیتم B</Dropdown.Item>
                <Dropdown.Item>آیتم C</Dropdown.Item>
                <Dropdown.Item>آیتم D</Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default Disabled
