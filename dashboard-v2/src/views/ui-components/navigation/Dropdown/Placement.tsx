import Dropdown from '@/components/ui/Dropdown'

const DropdownItems = () => (
    <>
        <Dropdown.Item eventKey="a">مورد A</Dropdown.Item>
        <Dropdown.Item eventKey="b">مورد B</Dropdown.Item>
        <Dropdown.Item eventKey="c">مورد C</Dropdown.Item>
        <Dropdown.Item eventKey="d">مورد D</Dropdown.Item>
    </>
)

const Placement = () => {
    return (
        <div className="grid grid-cols-3 gap-4 max-w-xl">
            <div>
                <Dropdown placement="top-start" title="بالا-چپ">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="top" title="بالا-مرکز">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="top-end" title="بالا-راست">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="bottom-start" title="پایین-چپ">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="bottom" title="پایین-مرکز">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="bottom-end" title="پایین-راست">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="right-start" title="راست-چپ">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="right" title="راست-مرکز">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="right-end" title="راست-راست">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="left-start" title="چپ-چپ">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="left" title="چپ-مرکز">
                    <DropdownItems />
                </Dropdown>
            </div>
            <div>
                <Dropdown placement="left-end" title="چپ-راست">
                    <DropdownItems />
                </Dropdown>
            </div>
        </div>
    )
}

export default Placement
