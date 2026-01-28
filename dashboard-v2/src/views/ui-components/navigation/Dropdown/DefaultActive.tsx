import Dropdown from '@/components/ui/Dropdown'

const DefaultActive = () => {
    return (
        <div>
            <Dropdown title="کلیک کن!" activeKey="a">
                <Dropdown.Item eventKey="a">آیتم A</Dropdown.Item>
                <Dropdown.Item eventKey="b">آیتم B</Dropdown.Item>
                <Dropdown.Item eventKey="c">آیتم C</Dropdown.Item>
                <Dropdown.Item eventKey="d">آیتم D</Dropdown.Item>
            </Dropdown>
            <Dropdown title="کلیک کن!" activeKey="item-2-1-2">
                <Dropdown.Item eventKey="item-1">آیتم 1</Dropdown.Item>
                <Dropdown.Menu eventKey="item-2" title="آیتم 2">
                    <Dropdown.Menu eventKey="item-2-1" title="آیتم 2-1">
                        <Dropdown.Item eventKey="item-2-1-1">
                            آیتم 2-1-1
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="item-2-1-2">
                            آیتم 2-1-2
                        </Dropdown.Item>
                        <Dropdown.Item eventKey="item-2-1-3">
                            آیتم 2-1-3
                        </Dropdown.Item>
                    </Dropdown.Menu>
                    <Dropdown.Item eventKey="item-2-2">آیتم 2-2</Dropdown.Item>
                    <Dropdown.Item eventKey="item-2-3">آیتم 2-3</Dropdown.Item>
                </Dropdown.Menu>
                <Dropdown.Item>آیتم 3</Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default DefaultActive
