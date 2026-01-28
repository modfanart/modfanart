/* eslint-disable react/no-unescaped-entities */
import Table from '@/components/ui/Table'

import DemoLayout from '@/components/docs/DemoLayout'

// Demo
import Notification from './Notification'
import NotificationType from './NotificationType'
import CustomIcon from './CustomIcon'
import Placement from './Placement'
import Closable from './Closable'
import AlertToast from './AlertToast'
import Duration from './Duration'
import CustomClose from './CustomClose'

const mdPath = 'Toast'

const demoHeader = {
    title: 'تست (Toast)',
    desc: 'تست برای نمایش پیام‌ها بر روی یک پوشش (Overlay) به منظور اطلاع‌رسانی وضعیت سیستم به کاربران استفاده می‌شود.',
}

const demos = [
    {
        mdName: 'Notification',
        mdPath: mdPath,
        title: 'اعلان (Notification)',
        desc: `اعلان با استفاده از تست ظاهر می‌شود.`,
        component: <Notification />,
    },
    {
        mdName: 'NotificationType',
        mdPath: mdPath,
        title: 'نوع اعلان (Notification Type)',
        desc: `نمایش <code>type</code> اعلان، آیکون و رنگ‌های متناظر را نشان می‌دهد. نوع می‌تواند <code>'info'</code>، <code>'warning'</code>، <code>'error'</code> یا <code>'success'</code> باشد.`,
        component: <NotificationType />,
    },
    {
        mdName: 'CustomIcon',
        mdPath: mdPath,
        title: 'آیکون سفارشی (Custom icon)',
        desc: `آیکون در اعلان می‌تواند با هر عنصر دیگری جایگزین شود.`,
        component: <CustomIcon />,
    },
    {
        mdName: 'Placement',
        mdPath: mdPath,
        title: 'موقعیت (Placement)',
        desc: `موقعیت تست می‌تواند در اطراف عنصر فعال‌کننده به صورت‌های مختلف قرار گیرد. ۶ گزینه برای موقعیت موجود است.`,
        component: <Placement />,
    },
    {
        mdName: 'Closable',
        mdPath: mdPath,
        title: 'قابل بسته‌شدن (Closable)',
        desc: `با فعال کردن پراپ <code>closable</code>، آیکون بستن در اعلان نمایش داده می‌شود.`,
        component: <Closable />,
    },
    {
        mdName: 'AlertToast',
        mdPath: mdPath,
        title: 'هشدار (Alert)',
        desc: `تست همچنین می‌تواند با <a href="/ui-components/alert" class="text-blue-500">هشدار (Alert)</a> استفاده شود.`,
        component: <AlertToast />,
    },
    {
        mdName: 'Duration',
        mdPath: mdPath,
        title: 'مدت‌زمان (Duration)',
        desc: `تنظیم پراپ <code>duration</code> برای اعلان مدت زمان باز بودن را مشخص می‌کند. اگر مقدار duration برابر <code>0</code> باشد، تست هرگز بسته نخواهد شد.`,
        component: <Duration />,
    },
    {
        mdName: 'CustomClose',
        mdPath: mdPath,
        title: 'بستن سفارشی (CustomClose)',
        desc: `<code>toast.push()</code> یک شناسه (UID) برای نمونه اعلان بازگشتی می‌دهد. می‌توان این شناسه را به متد <code>toast.remove(uid)</code> پاس داد تا اعلان مربوطه حذف شود.`,
        component: <CustomClose />,
    },
]

const demoApi = [
    {
        component: 'اعلان (Notification)',
        api: [
            {
                propName: 'closable',
                type: `<code>boolean</code>`,
                default: `<code>false</code>`,
                desc: 'نمایش یا عدم نمایش آیکون بستن',
            },
            {
                propName: 'customIcon',
                type: `<code>ReactNode</code> | <code>string</code>`,
                default: `-`,
                desc: 'عنصر سفارشی کنار محتوای اعلان',
            },
            {
                propName: 'duration',
                type: `<code>number</code>`,
                default: `<code>3000</code>`,
                desc: 'مدت زمان (به ثانیه) قبل از بسته شدن اعلان. اگر مقدار duration برابر 0 باشد، هرگز بسته نخواهد شد.',
            },
            {
                propName: 'onClose',
                type: `<code>(e: MouseEvent) => void</code>`,
                default: `<code>-</code>`,
                desc: 'کال‌بک زمانی که اعلان بسته می‌شود',
            },
            {
                propName: 'title',
                type: `<code>string</code>`,
                default: `-`,
                desc: 'عنوان اعلان',
            },
            {
                propName: 'type',
                type: `<code>'info'</code> | <code>'warning'</code> | <code>'success'</code> | <code>'danger'</code>`,
                default: `-`,
                desc: 'نوع اعلان',
            },
            {
                propName: 'width',
                type: `<code>number</code> | <code>string</code>`,
                default: `<code>350</code>`,
                desc: 'عرض اعلان',
            },
        ],
    },
]


const { Tr, Th, Td, THead, TBody } = Table

const toastApi = (
    <>
        <h4>API</h4>
        <div className="mt-4">
            <h6 className="mb-3">توست (toast)</h6>
            <Table className="demo-api-table mb-8">
                <THead>
                    <Tr>
                        <Th>متد</Th>
                        <Th>توضیحات</Th>
                    </Tr>
                </THead>
                <TBody>
                    <Tr>
                        <Td className="font-semibold">
                            <code>
                                toast.push(message: ReactNode, options?:
                                ToastProps): string
                            </code>
                        </Td>
                        <Td>
                            متدی برای نمایش پیام توست، که UID پیام توست فعلی را باز می‌گرداند
                        </Td>
                    </Tr>
                    <Tr>
                        <Td className="font-semibold">
                            <code>toast.remove(key: string): void</code>
                        </Td>
                        <Td>
                            متدی برای حذف پیام توست خاص با استفاده از کلید متد push
                        </Td>
                    </Tr>
                    <Tr>
                        <Td className="font-semibold">
                            <code>toast.removeAll(): void</code>
                        </Td>
                        <Td>متدی برای حذف تمام پیام‌های توست</Td>
                    </Tr>
                </TBody>
            </Table>
        </div>
        <div className="mt-4">
            <h6 className="mb-3">ویژگی اعلان (ToastProps)</h6>
            <Table className="demo-api-table mb-8">
                <THead>
                    <Tr>
                        <Th>پراپ</Th>
                        <Th>توضیحات</Th>
                        <Th>نوع</Th>
                        <Th>پیش‌فرض</Th>
                    </Tr>
                </THead>
                <TBody>
                    <Tr>
                        <Td className="font-semibold">block</Td>
                        <Td>آیا توست باید در عرض کامل نمایش داده شود؟</Td>
                        <Td>
                            <code>boolean</code>
                        </Td>
                        <Td>
                            <code>false</code>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td className="font-semibold">offsetX</Td>
                        <Td>افزایش X توست</Td>
                        <Td>
                            <code>number</code>
                        </Td>
                        <Td>
                            <code>30</code>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td className="font-semibold">offsetY</Td>
                        <Td>افزایش Y توست</Td>
                        <Td>
                            <code>number</code>
                        </Td>
                        <Td>
                            <code>30</code>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td className="font-semibold">placement</Td>
                        <Td>محل نمایش توست</Td>
                        <Td>
                            <code>'top-start'</code> | <code>'top-center'</code>{' '}
                            | <code>'top-end'</code> |{' '}
                            <code>'bottom-start'</code> |{' '}
                            <code>'bottom-center'</code> |{' '}
                            <code>'bottom-end'</code>
                        </Td>
                        <Td>
                            <code>'top-end'</code>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td className="font-semibold">transitionType</Td>
                        <Td>نوع انتقال انیمیشن</Td>
                        <Td>
                            <code>'scale'</code> | <code>'fade'</code>
                        </Td>
                        <Td>
                            <code>'scale'</code>
                        </Td>
                    </Tr>
                </TBody>
            </Table>
        </div>
    </>
)

const Noification = () => {
    return (
        <DemoLayout
            header={demoHeader}
            demos={demos}
            api={demoApi}
            note={toastApi}
            hideApiTitle={true}
        />
    )
}

export default Noification
