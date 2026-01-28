import Alert from '@/components/ui/Alert'
import { HiFire } from 'react-icons/hi'

const Icon = () => {
    return (
        <div>
            <Alert showIcon type="success" customIcon={<HiFire />}>
                توضیحات و اطلاعات بیشتر در مورد کپی رایتینگ.
            </Alert>
        </div>
    )
}

export default Icon
