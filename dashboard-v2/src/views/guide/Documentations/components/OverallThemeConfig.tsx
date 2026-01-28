import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'
import DemoComponentApi from '@/components/docs/DemoComponentApi'

const OverallThemeConfig = () => {
    return (
        <>
            <p>
                فایل <code>src/configs/theme.config.ts</code> شامل تنظیمات پیش‌فرض تم برای الگو است. این تنظیمات از پیش تعریف شده‌اند، اما می‌توانند برای تطابق با نیازهای شما سفارشی‌سازی شوند. در زیر تنظیمات پیش‌فرض آمده است:
            </p>
            <SyntaxHighlighter language="ts">{`import { THEME_ENUM } from '@/constants/theme.constant'
import {
    Direction,
    Mode,
    ControlSize,
    LayoutType,
} from '@/@types/theme'

export type ThemeConfig = {
    themeSchema: string
    direction: Direction
    mode: Mode
    panelExpand: boolean
    controlSize: ControlSize
    layout: {
        type: LayoutType
        sideNavCollapse: boolean
    }
}

export const themeConfig: ThemeConfig = {
    themeSchema: '',
    direction: THEME_ENUM.DIR_LTR,
    mode: THEME_ENUM.MODE_LIGHT,
    panelExpand: false,
    controlSize: 'md',
    layout: {
        type: THEME_ENUM.LAYOUT_COLLAPSIBLE_SIDE,
        sideNavCollapse: false,
    },
}`}</SyntaxHighlighter>
            <div className="mt-10" id="properties">
                <h5>ویژگی‌های پیکربندی</h5>
                <DemoComponentApi
                    hideApiTitle
                    api={[
                        {
                            api: [
                                {
                                    propName: 'themeSchema',
                                    type: `<code>string</code>`,
                                    default: `<code>''</code>`,
                                    desc: 'رنگ‌بندی تم الگو را تنظیم می‌کند. می‌توانید این فیلد را خالی بگذارید اگر تم دینامیک در اپلیکیشن شما وجود دارد.',
                                },
                                {
                                    propName: 'direction',
                                    type: `<code>'ltr'</code> | <code>'rtl'</code>`,
                                    default: `<code>'ltr'</code>`,
                                    desc: 'جهت متن برای الگو را تعریف می‌کند.',
                                },
                                {
                                    propName: 'mode',
                                    type: `<code>'light'</code> | <code>'dark'</code>`,
                                    default: `<code>'light'</code>`,
                                    desc: 'بین حالت روشن و تاریک سوئیچ می‌کند.',
                                },
                                {
                                    propName: 'panelExpand',
                                    type: `<code>boolean</code>`,
                                    default: `<code>false</code>`,
                                    desc: 'مشخص می‌کند که آیا پنل کناری به‌طور پیش‌فرض باز است یا خیر.',
                                },
                                {
                                    propName: 'controlSize',
                                    type: `<code>'xs'</code> | <code>'sm'</code> | <code>'md'</code> | <code>'lg'</code>`,
                                    default: `<code>'md'</code>`,
                                    desc: 'اندازه اولیه ورودی‌های کنترل را تنظیم می‌کند.',
                                },
                                {
                                    propName: 'layout.type',
                                    type: `<code>'blank'</code>  | <code>'collapsibleSide'</code> | <code>'stackedSide'</code> | <code>'topBarClassic'</code> | <code>'framelessSide'</code> | <code>'contentOverlay'</code>`,
                                    default: `<code>'modern'</code>`,
                                    desc: 'سبک کلی چیدمان اپلیکیشن را تعریف می‌کند.',
                                },
                                {
                                    propName: 'layout.sideNavCollapse',
                                    type: `<code>boolean</code>`,
                                    default: `<code>false</code>`,
                                    desc: `مشخص می‌کند که آیا ناوبری جانبی جمع شده است یا خیر. این گزینه فقط زمانی کاربرد دارد که <code>type</code> به <code>'collapsibleSide'</code> یا <code>'framelessSide'</code> تنظیم شده باشد.`,
                                },
                            ],
                        },
                    ]}
                />
            </div>
            <div className="mt-10" id="persistence">
                <h5>پایداری وضعیت</h5>
                <p>
                    وضعیت <code>themeConfig</code> به‌طور پیش‌فرض پایداری دارد، به این معنی که تنظیمات شما توسط مرورگر حفظ می‌شود. اگر ترجیح می‌دهید وضعیت تم برای کاربران حفظ نشود، می‌توانید <code>src/store/themeStore.ts</code> را با حذف متد <code>persist</code> از ذخیره‌سازی Zustand تغییر دهید.
                </p>
                <p>
                    وضعیت پایداری شده همچنین در <code>localStorage</code> مرورگر ذخیره می‌شود. اگر با مشکلی مواجه شدید که تغییرات تم اعمال نمی‌شود، ممکن است بخواهید کلید <code>'theme'</code> در <code>localStorage</code> را پاک کنید. می‌توانید این کار را با اجرای <code>localStorage.removeItem('theme')</code> در کنسول مرورگر انجام دهید.
                </p>
            </div>
        </>
    )
}

export default OverallThemeConfig
