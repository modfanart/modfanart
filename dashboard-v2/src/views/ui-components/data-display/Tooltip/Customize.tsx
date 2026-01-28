import Tooltip from '@/components/ui/Tooltip'

const Customize = () => {
    return (
        <div>
            <Tooltip
                title={
                    <div>
                        این{' '}
                        <strong className="text-yellow-400">HTML</strong>
                    </div>
                }
            >
                <span className="cursor-pointer">روی من بایستید</span>
            </Tooltip>
        </div>
    )
}

export default Customize
