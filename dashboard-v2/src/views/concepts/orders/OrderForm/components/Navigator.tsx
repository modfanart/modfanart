import Avatar from '@/components/ui/Avatar'
// eslint-disable-next-line import/named
import { Link } from 'react-scroll'
import { TbPackage, TbUserSquare, TbMapPin, TbCreditCard } from 'react-icons/tb'

const navigationList = [
    {
        label: 'انتخاب محصولات',
        description: 'افزودن محصول به لیست خرید.',
        link: 'selectProducts',
        icon: <TbPackage />,
    },
    {
        label: 'اطلاعات مشتری',
        description:
            'وارد کردن اطلاعات مشتری مانند نام، ایمیل و شماره تلفن.',
        link: 'customerDetails',
        icon: <TbUserSquare />,
    },
    {
        label: 'اطلاعات آدرس',
        description: 'ارائه جزئیات آدرس حمل و نقل.',
        link: 'addressInformation',
        icon: <TbMapPin />,
    },
    {
        label: 'پرداخت',
        description:
            'وارد کردن روش و جزئیات پرداخت برای تکمیل تراکنش.',
        link: 'payment',
        icon: <TbCreditCard />,
    },
];


const Navigator = () => {
    return (
        <div className="flex flex-col gap-2">
            {navigationList.map((nav) => (
                <Link
                    key={nav.label}
                    activeClass="bg-gray-100 dark:bg-gray-700 active"
                    className="cursor-pointer p-4 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-700"
                    to={nav.link}
                    spy={true}
                    smooth={true}
                    duration={500}
                    offset={-80}
                >
                    <span className="flex items-center gap-2">
                        <Avatar
                            icon={nav.icon}
                            className="bg-gray-100 dark:bg-gray-700 group-hover:bg-white group-[.active]:bg-white dark:group-hover:bg-gray-800 dark:group-[.active]:bg-gray-800 heading-text "
                        />
                        <span className="flex flex-col flex-1">
                            <span className="heading-text font-bold">
                                {nav.label}
                            </span>
                            <span>{nav.description}</span>
                        </span>
                    </span>
                </Link>
            ))}
        </div>
    )
}

export default Navigator
