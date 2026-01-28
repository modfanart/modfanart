import Steps from '@/components/ui/Steps'
import Spinner from '@/components/ui/Spinner'
import {
    HiOutlineLogin,
    HiOutlineDocumentSearch,
    HiOutlineClipboardCheck,
} from 'react-icons/hi'

const CustomIcon = () => {
    return (
        <div>
            <Steps current={1}>
                <Steps.Item title="ورود" customIcon={<HiOutlineLogin />} />
                <Steps.Item title="سفارش ثبت شده" customIcon={<Spinner />} />
                <Steps.Item
                    title="در حال بررسی"
                    customIcon={<HiOutlineDocumentSearch />}
                />
                <Steps.Item
                    title="تأیید شده"
                    customIcon={<HiOutlineClipboardCheck />}
                />
            </Steps>
        </div>
    )
}

export default CustomIcon
