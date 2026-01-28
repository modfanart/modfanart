import InputGroup from '@/components/ui/InputGroup'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const Sizes = () => {
    return (
        <div>
            <InputGroup size="sm" className="mb-4">
                <InputGroup.Addon>@</InputGroup.Addon>
                <Input placeholder="ورودی کوچک" />
                <Button variant="solid">ارسال</Button>
            </InputGroup>
            <InputGroup size="lg" className="mb-4">
                <InputGroup.Addon>@</InputGroup.Addon>
                <Input placeholder="ورودی بزرگ" />
                <Button variant="solid">ارسال</Button>
            </InputGroup>
        </div>
    )
}

export default Sizes
