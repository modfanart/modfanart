import { useState } from 'react'
import Segment from '@/components/ui/Segment'

type SizeType = 'lg' | 'md' | 'sm' | 'xs'

const Size = () => {
    const [size, setSize] = useState<SizeType>('md')

    const onSizeChange = (val: SizeType) => {
        setSize(val)
    }

    return (
        <Segment
            size={size}
            value={size}
            onChange={(value) => onSizeChange(value as SizeType)}
        >
            <Segment.Item value="xs">خیلی کوچک</Segment.Item>
            <Segment.Item value="sm">کوچک</Segment.Item>
            <Segment.Item value="md">متوسط</Segment.Item>
            <Segment.Item value="lg">بزرگ</Segment.Item>
        </Segment>
    )
}

export default Size
