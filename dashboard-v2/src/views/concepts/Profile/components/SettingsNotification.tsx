import Checkbox from '@/components/ui/Checkbox'
import Radio from '@/components/ui/Radio'
import Switcher from '@/components/ui/Switcher'
import { apiGetSettingsNotification } from '@/services/AccontsService'
import useSWR from 'swr'
import cloneDeep from 'lodash/cloneDeep'
import { TbMessageCircleCheck } from 'react-icons/tb'
import type { GetSettingsNotificationResponse } from '../types'

type EmailNotificationFields =
    | 'newsAndUpdate'
    | 'tipsAndTutorial'
    | 'offerAndPromotion'
    | 'followUpReminder'

const emailNotificationOption: {
    label: string
    value: EmailNotificationFields
    desc: string
}[] = [{
    label: 'اخبار و به‌روزرسانی‌ها',
    value: 'newsAndUpdate',
    desc: 'اخبار جدید درباره محصول و به‌روزرسانی ویژگی‌ها',
},
{
    label: 'نکات و آموزش‌ها',
    value: 'tipsAndTutorial',
    desc: 'نکات و ترفندهایی برای افزایش کارایی و بهره‌وری',
},
{
    label: 'پیشنهادها و تخفیف‌ها',
    value: 'offerAndPromotion',
    desc: 'اطلاع‌رسانی درباره قیمت محصول و آخرین تخفیف‌ها',
},
{
    label: 'یادآوری پیگیری',
    value: 'followUpReminder',
    desc: 'دریافت اعلان برای تمام یادآوری‌های ایجاد شده',
}
    ]

const notifyMeOption: {
    label: string
    value: string
    desc: string
}[] = [
        {
            label: 'همه پیام‌های جدید',
            value: 'allNewMessage',
            desc: 'برای هر پیام جدید به کانال اعلان بفرست',
        },
        {
            label: 'فقط منشن‌ها',
            value: 'mentionsOnly',
            desc: 'فقط زمانی در کانال هشدار بده که کسی من رو در پیامی منشن کنه',
        },
        {
            label: 'هیچ‌چیز',
            value: 'nothing',
            desc: 'هیچ اعلانی به من نده',
        }
    ]

const SettingsNotification = () => {
    const {
        data = {
            email: [],
            desktop: false,
            unreadMessageBadge: false,
            notifymeAbout: '',
        },
        mutate,
    } = useSWR(
        '/api/settings/notification/',
        () => apiGetSettingsNotification<GetSettingsNotificationResponse>(),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    const handleEmailNotificationOptionChange = (values: string[]) => {
        const newData = cloneDeep(data)
        newData.email = values
        mutate(newData, false)
    }

    const handleEmailNotificationOptionCheckAll = (value: boolean) => {
        const newData = cloneDeep(data)
        if (value) {
            newData.email = [
                'newsAndUpdate',
                'tipsAndTutorial',
                'offerAndPromotion',
                'followUpReminder',
            ]
        } else {
            newData.email = []
        }

        mutate(newData, false)
    }

    const handleDesktopNotificationCheck = (value: boolean) => {
        const newData = cloneDeep(data)
        newData.desktop = value
        mutate(newData, false)
    }

    const handleUnreadMessagebadgeCheck = (value: boolean) => {
        const newData = cloneDeep(data)
        newData.unreadMessageBadge = value
        mutate(newData, false)
    }

    const handleNotifyMeChange = (value: string) => {
        const newData = cloneDeep(data)
        newData.notifymeAbout = value
        mutate(newData, false)
    }

    return (
        <div>
            <h4>اعلان‌ها</h4>
            <div className="mt-2">
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>فعال‌سازی اعلان‌های دسکتاپ</h5>
                        <p>تصمیم بگیرید که آیا می‌خواهید برای پیام‌ها و به‌روزرسانی‌های جدید اعلان دریافت کنید</p>
                    </div>
                    <div>
                        <Switcher
                            checked={data.desktop}
                            onChange={handleDesktopNotificationCheck}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>فعال‌سازی نشان اعلان‌های خوانده‌نشده</h5>
                        <p>نشانگر قرمز بر روی آیکون اعلان نمایش داده شود وقتی پیام خوانده‌نشده دارید</p>
                    </div>
                    <div>
                        <Switcher
                            checked={data.unreadMessageBadge}
                            onChange={handleUnreadMessagebadgeCheck}
                        />
                    </div>
                </div>
                <div className="py-6 border-b border-gray-200 dark:border-gray-600">
                    <h5>فعال‌سازی نشان اعلان‌های خوانده‌نشده</h5>
                    <div className="mt-4">
                        <Radio.Group
                            vertical
                            className="flex flex-col gap-6"
                            value={data.notifymeAbout}
                            onChange={handleNotifyMeChange}
                        >
                            {notifyMeOption.map((option) => (
                                <div key={option.value} className="flex gap-4">
                                    <div className="mt-1.5">
                                        <Radio value={option.value} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="mt-1">
                                            <TbMessageCircleCheck className="text-lg" />
                                        </div>
                                        <div>
                                            <h6>{option.label}</h6>
                                            <p>{option.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Radio.Group>
                    </div>
                </div>
                <div className="flex items-center justify-between py-6">
                    <div>
                        <h5>اعلان‌های ایمیلی</h5>
                        <p>Substance می‌تواند برای هر پیام مستقیم جدید برای شما ایمیل ارسال کند</p>
                    </div>
                    <div>
                        <Switcher
                            checked={data.email.length > 0}
                            onChange={handleEmailNotificationOptionCheckAll}
                        />
                    </div>
                </div>
                <Checkbox.Group
                    vertical
                    className="flex flex-col gap-6"
                    value={data.email}
                    onChange={handleEmailNotificationOptionChange}
                >
                    {emailNotificationOption.map((option) => (
                        <div key={option.value} className="flex gap-4">
                            <div className="mt-1.5">
                                <Checkbox value={option.value} />
                            </div>
                            <div>
                                <h6>{option.label}</h6>
                                <p>{option.desc}</p>
                            </div>
                        </div>
                    ))}
                </Checkbox.Group>
            </div>
        </div>
    )
}

export default SettingsNotification
