import { useMemo } from 'react'
import Progress from '@/components/ui/Progress'

type ProgressionBarProps = {
    progression: number
}

const ProgressionBar = ({ progression }: ProgressionBarProps) => {
    const progressExtraProps = useMemo(() => {
        if (progression > 70) {
            return { customColorClass: 'bg-success' }
        }

        if (progression < 40) {
            return { customColorClass: 'bg-error' }
        }

        return { customColorClass: 'bg-amber-400' }
    }, [progression])

    return <Progress size="sm" percent={progression} {...progressExtraProps} />
}

export default ProgressionBar
