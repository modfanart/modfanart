import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Tooltip from '@/components/ui/Tooltip'
import { HiOutlineQuestionMarkCircle } from 'react-icons/hi'

const tip = (
    <Tooltip title="Field info">
        <HiOutlineQuestionMarkCircle className="text-lg cursor-pointer ml-1" />
    </Tooltip>
)

const optional = <span className="ml-1 opacity-60">(اختیاری)</span>

const LabelExtra = () => {
    return (
        <Form action="#">
            <FormItem label="نام" extra={tip}>
                <Input type="text" name="fieldA" placeholder="لطفاً وارد کنید" />
            </FormItem>
            <FormItem label="ایمیل" extra={optional}>
                <Input type="text" name="fieldB" placeholder="لطفاً وارد کنید" />
            </FormItem>
            <FormItem>
                <Button variant="solid" type="button">
                    ارسال
                </Button>
            </FormItem>
        </Form>
    )
}

export default LabelExtra
