import Tooltip from '@/components/ui/Tooltip'

const Placement = () => {
    return (
        <div
            style={{ maxWidth: 700 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
            <div></div>
            <Tooltip title="بالا-چپ" placement="top-start">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    بالا-چپ
                </div>
            </Tooltip>
            <Tooltip title="بالا" placement="top">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    بالا
                </div>
            </Tooltip>
            <Tooltip title="بالا-راست" placement="top-end">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    بالا-راست
                </div>
            </Tooltip>
            <div></div>
            <Tooltip title="چپ-چپ" placement="left-start">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    چپ-چپ
                </div>
            </Tooltip>
            <div></div>
            <div></div>
            <div></div>
            <Tooltip title="راست-چپ" placement="right-start">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    راست-چپ
                </div>
            </Tooltip>
            <Tooltip title="چپ" placement="left">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    چپ
                </div>
            </Tooltip>
            <div></div>
            <div></div>
            <div></div>
            <Tooltip title="راست" placement="right">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    راست
                </div>
            </Tooltip>
            <Tooltip title="چپ-راست" placement="left-end">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    چپ-راست
                </div>
            </Tooltip>
            <div></div>
            <div></div>
            <div></div>
            <Tooltip title="راست-راست" placement="right-end">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    راست-راست
                </div>
            </Tooltip>
            <div></div>
            <Tooltip title="پایین-چپ" placement="bottom-start">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    پایین-چپ
                </div>
            </Tooltip>
            <Tooltip title="پایین" placement="bottom">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    پایین
                </div>
            </Tooltip>
            <Tooltip title="پایین-راست" placement="bottom-end">
                <div className="border border-gray-200 py-2 px-4 text-center cursor-pointer w-full">
                    پایین-راست
                </div>
            </Tooltip>
            <div></div>
        </div>
    )
}

export default Placement
