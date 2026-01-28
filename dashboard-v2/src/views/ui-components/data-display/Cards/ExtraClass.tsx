import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const ExtraClass = () => {
    const cardFooter = (
        <div className="flex">
            <Button size="sm" className="ltr:mr-2 rtl:ml-2">
                ذخیره
            </Button>
            <Button size="sm" variant="solid">
                پست جدید
            </Button>
        </div>
    )

    return (
        <div>
            <Card
                header={{
                    content: <span>هدر کارت</span>,
                    className: 'font-semibold text-lg text-indigo-600',
                }}
                footer={{
                    content: cardFooter,
                    className: 'flex justify-end',
                }}
                bodyClass="text-center"
            >
                <p>
                    لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می‌باشد.
                </p>
            </Card>
        </div>
    )
}


export default ExtraClass
