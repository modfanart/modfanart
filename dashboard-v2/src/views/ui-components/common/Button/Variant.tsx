import Button from '@/components/ui/Button'

const Variant = () => {
    return (
        <div className="inline-flex flex-wrap xl:flex gap-2">
            <Button>پیش‌فرض</Button>
            <Button variant="solid">صلب</Button>
            <Button variant="plain">ساده</Button>
        </div>
    )
}

export default Variant
