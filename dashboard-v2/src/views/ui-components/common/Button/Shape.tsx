import Button from '@/components/ui/Button'

const Shape = () => {
    return (
        <div className="flex-wrap inline-flex xl:flex items-center gap-2">
            <Button>گرد (Rounded)</Button>
            <Button shape="none">هیچ (None)</Button>
            <Button shape="circle">دایره‌ای (Circle)</Button>
        </div>
    )
}

export default Shape
