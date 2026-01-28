import Dropdown from '@/components/ui/Dropdown'

const Trigger = () => {
    return (
        <div className="flex">
            <Dropdown title="کلیک کنید" className="mr-2">
                <Dropdown.Item eventKey="a">آیتم فعال</Dropdown.Item>
                <Dropdown.Item eventKey="b">آیتم B</Dropdown.Item>
                <Dropdown.Item eventKey="c">آیتم C</Dropdown.Item>
                <Dropdown.Item eventKey="d">آیتم D</Dropdown.Item>
            </Dropdown>
            <Dropdown title="هاور" trigger="hover" className="mr-2">
                <Dropdown.Item eventKey="a">آیتم فعال</Dropdown.Item>
                <Dropdown.Item eventKey="b">آیتم B</Dropdown.Item>
                <Dropdown.Item eventKey="c">آیتم C</Dropdown.Item>
                <Dropdown.Item eventKey="d">آیتم D</Dropdown.Item>
            </Dropdown>
            <Dropdown title="کلیک راست" trigger="context" className="mr-2">
                <Dropdown.Item eventKey="a">آیتم فعال</Dropdown.Item>
                <Dropdown.Item eventKey="b">آیتم B</Dropdown.Item>
                <Dropdown.Item eventKey="c">آیتم C</Dropdown.Item>
                <Dropdown.Item eventKey="d">آیتم D</Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default Trigger
