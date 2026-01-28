import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'

const HeaderFooterBorder = () => {
    const cardFooter = (
        <div className="flex items-center">
            <Avatar
                size={30}
                className="mr-2"
                shape="circle"
                src="/img/avatars/thumb-1.jpg"
            />
            <span>
                <h6 className="text-sm">کریستن فیشر</h6>
                <span className="text-xs">30 آذر 1403</span>
            </span>
        </div>
    )

    const cardHeader = (
        <div className="rounded-tl-lg rounded-tr-lg overflow-hidden">
            <img src="/img/others/img-1.jpg" alt="هدر کارت" />
        </div>
    )

    return (
        <div className="max-w-xs">
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out dark:border dark:border-gray-600 dark:border-solid"
                header={{
                    content: cardHeader,
                    bordered: false,
                    className: 'p-0',
                }}
                footer={{
                    content: cardFooter,
                    bordered: false,
                }}
            >
                <span className="text-emerald-600 font-semibold">
                    سبک زندگی
                </span>
                <h4 className="font-bold my-3">از قوانین مدرن استفاده کنید</h4>
                <p>
                    متن ساختگی چاپ و صنعت چاپ است. لورم ایپسوم از دیرباز استاندارد
                    متن‌های صنعتی بوده است.
                </p>
            </Card>
        </div>
    )
}


export default HeaderFooterBorder
