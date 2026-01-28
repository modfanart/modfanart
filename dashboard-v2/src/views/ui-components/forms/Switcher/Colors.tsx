import Switcher from '@/components/ui/Switcher'

const Colors = () => {
    return (
        <div>
            <div className="mb-4">
                <Switcher defaultChecked switcherClass="bg-green-500" />
            </div>
            <div className="mb-4">
                <Switcher defaultChecked switcherClass="bg-red-500" />
            </div>
        </div>
    )
}

export default Colors
