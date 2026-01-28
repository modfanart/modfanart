import Button from '@/components/ui/Button'
import { HiPhone } from 'react-icons/hi'

const Icon = () => {
    return (
        <>
            <div className="flex-wrap inline-flex xl:flex items-center gap-2">
                <Button shape="circle" size="xs" icon={<HiPhone />} />
                <Button shape="circle" size="sm" icon={<HiPhone />} />
                <Button shape="circle" icon={<HiPhone />} />
                <Button shape="circle" size="lg" icon={<HiPhone />} />
            </div>
            <br />
            <div className="flex-wrap inline-flex xl:flex items-center gap-2">
                <Button size="xs" icon={<HiPhone />} />
                <Button size="sm" icon={<HiPhone />} />
                <Button icon={<HiPhone />} />
                <Button size="lg" icon={<HiPhone />} />
            </div>
        </>
    )
}

export default Icon
