```jsx
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

const optional = <span className="ml-1 opacity-60">(optional)</span>

const LabelExtra = () => {
    return (
        <Form action="#">
            <FormItem label="Name" extra={tip}>
                <Input type="text" name="fieldA" placeholder="Please Input" />
            </FormItem>
            <FormItem label="Email" extra={optional}>
                <Input type="text" name="fieldB" placeholder="Please Input" />
            </FormItem>
            <FormItem>
                <Button variant="solid" type="button">
                    Submit
                </Button>
            </FormItem>
        </Form>
    )
}

export default LabelExtra
```
