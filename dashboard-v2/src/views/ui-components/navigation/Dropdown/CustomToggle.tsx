import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'

const CustomToggle = () => {
    const Toggle = <Button>تغییر وضعیت به عنوان دکمه</Button>

    return (
        <div>
            <Dropdown renderTitle={Toggle}>
                <Dropdown.Item eventKey="a">آیتم A</Dropdown.Item>
                <Dropdown.Item eventKey="b">آیتم B</Dropdown.Item>
                <Dropdown.Item eventKey="c">آیتم C</Dropdown.Item>
                <Dropdown.Item eventKey="d">آیتم D</Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default CustomToggle
