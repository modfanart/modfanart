import GrowShrinkValue from '@/components/shared/GrowShrinkValue'

const Icon = () => {
    return (
        <div className="flex gap-4">
            <GrowShrinkValue
                value={21.12}
                suffix="%"
                positiveIcon="+"
                negativeIcon=""
            />
            <GrowShrinkValue
                value={-21.12}
                suffix="%"
                positiveIcon="+"
                negativeIcon=""
            />
        </div>
    )
}

export default Icon
