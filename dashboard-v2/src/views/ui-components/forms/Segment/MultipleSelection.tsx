import Segment from '@/components/ui/Segment'

const MultipleSelection = () => {
    return (
        <Segment selectionType="multiple">
            <Segment.Item value="left">چپ</Segment.Item>
            <Segment.Item value="center">مرکز</Segment.Item>
            <Segment.Item value="right">راست</Segment.Item>
        </Segment>
    )
}

export default MultipleSelection
