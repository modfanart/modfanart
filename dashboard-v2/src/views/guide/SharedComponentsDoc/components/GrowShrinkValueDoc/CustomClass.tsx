import GrowShrinkValue from '@/components/shared/GrowShrinkValue'

const CustomClass = () => {
    return (
        <div className="flex gap-4">
            <GrowShrinkValue value={1.68} positiveClass="text-indigo-500" />
            <GrowShrinkValue value={-1.68} negativeClass="text-sky-500" />
        </div>
    )
}

export default CustomClass
