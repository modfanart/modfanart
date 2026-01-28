import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { HiCheckCircle } from 'react-icons/hi'

const HeaderFooter = () => {
    const headerExtraContent = (
        <span className="flex items-center">
            <span className="mr-1 font-semibold">وضعیت:</span>
            <span className="text-emerald-500 text-xl">
                <HiCheckCircle />
            </span>
        </span>
    )

    const cardFooter = (
        <div className="flex justify-end">
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
                    extra: headerExtraContent,
                }}
                footer={{
                    content: cardFooter,
                }}
            >
                <p>
                    لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می‌باشد.
                </p>
            </Card>
        </div>
    )
}


export default HeaderFooter
