import Card from '@/components/ui/Card'

const Clickable = () => {
    return (
        <div className="max-w-xs">
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out"
                onClick={(e) => console.log('Card Clickable', e)}
            >
                <h5>عنوان کارت</h5>
                <p className="mt-2">
                    متنی کوتاه برای ساختن روی عنوان کارت و پر کردن بیشتر محتوای کارت.
                </p>
            </Card>
        </div>
    )
}

export default Clickable
