import { TbRocket, TbLeaf, TbRosetteDiscount } from 'react-icons/tb'
import type { ReactNode } from 'react'

export const campaignTypeOption: Record<
    string,
    {
        label: string
        icon: ReactNode
    }
> = {
    promotional: {
        label: 'تبلیغاتی',
        icon: <TbRosetteDiscount />,
    },
    seasonal: {
        label: 'فصلی',
        icon: <TbLeaf />,
    },
    launch: {
        label: 'راه‌اندازی',
        icon: <TbRocket />,
    },
}
