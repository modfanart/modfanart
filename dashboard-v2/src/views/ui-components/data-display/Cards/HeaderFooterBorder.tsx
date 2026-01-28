import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const HeaderFooterBorder = () => {
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
                    content: 'هدر کارت',
                    bordered: false,
                }}
                footer={{
                    content: cardFooter,
                    bordered: false,
                }}
            >
                <p>
                    لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می‌باشد. کتاب‌های زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می‌طلبد.
                </p>
            </Card>
        </div>
    )
}

export default HeaderFooterBorder
