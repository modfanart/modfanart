import GrowShrinkValue from '@/components/shared/GrowShrinkValue'

const Basic = () => {
    return (
        <div className="flex gap-4">
            <GrowShrinkValue value={21.12} suffix="%" />
            <GrowShrinkValue value={-0.48} prefix="$" />
        </div>
    )
}

export default Basic
