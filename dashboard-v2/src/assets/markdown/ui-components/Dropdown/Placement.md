```jsx
import Dropdown from '@/components/ui/Dropdown'

const DropdownItems = () => (
    <>
        <Dropdown.Item eventKey="a">Item A</Dropdown.Item>
        <Dropdown.Item eventKey="b">Item B</Dropdown.Item>
        <Dropdown.Item eventKey="c">Item C</Dropdown.Item>
        <Dropdown.Item eventKey="d">Item D</Dropdown.Item>
    </>
)

const Placement = () => {
    return (
        <div className="grid grid-cols-3 gap-4 max-w-xl">
            <div>
                <Dropdown placement="top-start" title="Top start">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="top" title="Top center">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="top-end" title="Top end">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="bottom-start" title="Bottom start">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="bottom" title="Bottom center">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="bottom-end" title="Bottom end">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="right-start" title="Right start">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="right" title="Right center">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="right-end" title="Right end">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="left-start" title="Left start">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="left" title="Left center">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="left-end" title="Left end">
                    <DropdownItems />
                </Dropdown>
            </div>
        </div>
    )
}

export default Placement
```
