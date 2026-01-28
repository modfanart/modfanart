import Card from '@/components/ui/Card'

const BorderLess = () => {
    return (
        <div>
            <Card bordered={false}>
                <h5>عنوان کارت</h5>
                <p>
                    متنی کوتاه برای ساختن روی عنوان کارت و پر کردن بیشتر محتوای کارت.
                </p>
            </Card>
        </div>
    )
}

export default BorderLess
