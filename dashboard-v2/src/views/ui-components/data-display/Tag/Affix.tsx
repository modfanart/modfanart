import Tag from '@/components/ui/Tag'
import { HiPlusCircle, HiX } from 'react-icons/hi'

const Affix = () => {
    return (
        <div className="flex">
            <div className="mr-2 rtl:ml-2">
                <Tag prefix>برچسب 1</Tag>
            </div>
            <div className="mr-2 rtl:ml-2">
                <Tag prefix prefixClass="bg-emerald-500">
                    برچسب 2
                </Tag>
            </div>
            <div className="mr-2 rtl:ml-2">
                <Tag
                    prefix={
                        <HiPlusCircle className="text-base text-blue-500 mr-1 rtl:ml-1" />
                    }
                >
                    برچسب 3
                </Tag>
            </div>
            <div className="mr-2 rtl:ml-2">
                <Tag suffix suffixClass="bg-rose-500">
                    برچسب 4
                </Tag>
            </div>
            <div className="mr-2 rtl:ml-2">
                <Tag suffix={<HiX className="ml-1 rtl:mr-1 cursor-pointer" />}>
                    برچسب 5
                </Tag>
            </div>
        </div>
    )
}

export default Affix
