import Avatar from '@/components/ui/Avatar'
import { HiOutlineUser } from 'react-icons/hi'

const Shape = () => {
    return (
        <div className="flex">
            <Avatar shape="square" className="mr-4" icon={<HiOutlineUser />} />
            <Avatar shape="round" className="mr-4" icon={<HiOutlineUser />} />
            <Avatar className="mr-4" icon={<HiOutlineUser />} />
        </div>
    )
}

export default Shape
