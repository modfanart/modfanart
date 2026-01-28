import Button from '@/components/ui/Button'

const Disabled = () => {
    return (
        <div className="flex items-center gap-2">
        <Button disabled variant="default">
            پیش‌فرض
        </Button>
        <Button disabled variant="solid">
            صلب
        </Button>
        <Button disabled variant="plain">
            ساده
        </Button>
    </div>    
    )
}

export default Disabled
