import Button from '@/components/ui/Button'

const Size = () => {
    return (
        <div className="flex-wrap inline-flex xl:flex items-center gap-2">
            <Button size="xs">خیلی کوچک (xs)</Button>
            <Button size="sm">کوچک (sm)</Button>
            <Button>متوسط (md)</Button>
            <Button size="lg">بزرگ (lg)</Button>
        </div>
    )
}

export default Size
