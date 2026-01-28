import Segment from '@/components/ui/Segment'

const Disabled = () => {
    return (
        <Segment>
            <Segment.Item value="left">چپ</Segment.Item>
            <Segment.Item disabled value="center">
                مرکز
            </Segment.Item>
            <Segment.Item value="right">راست</Segment.Item>
        </Segment>
    )
}

export default Disabled
