/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const ThemeColor = () => {
    return (
        <>
            <p>
                ما رنگ‌بندی تم را با استفاده از متغیرهای CSS مدیریت می‌کنیم، که این امکان را می‌دهد تا تم را به راحتی سفارشی‌سازی و گسترش دهیم. شما می‌توانید رنگ‌های تم را با ویرایش متغیرهای CSS در فایلی که در مسیر
                <code>assets/styles/tailwind/index.css</code>
                قرار دارد، تغییر دهید.
            </p>
            <p>در اینجا تنظیمات پیش‌فرض برای حالت‌های روشن و تاریک آمده است:</p>
            <SyntaxHighlighter language="css">{`:root {
    --neutral: #ffffff;
    --primary: #2a85ff;
    --primary-deep: #0069f6;
    --primary-mild: #4996ff;
    --primary-subtle: #2a85ff1a;
    --error: #ff6a55;
    --error-subtle: #ff6a551a;
    --success: #10b981;
    --success-subtle: #05eb7624;
    --info: #2a85ff;
    --info-subtle: #2a85ff1a;
    --warning: #f59e0b;
    --warning-subtle: #ffd40045;
    --gray-50: #fafafa;
    --gray-100: #f5f5f5;
    --gray-200: #e5e5e5;
    --gray-300: #d4d4d4;
    --gray-400: #a3a3a3;
    --gray-500: #737373;
    --gray-600: #525252;
    --gray-700: #404040;
    --gray-800: #262626;
    --gray-900: #171717;
    --gray-950: #0a0a0a;
}

.dark {
    --neutral: #ffffff;
    --primary: #2a85ff;
    --primary-deep: #0069f6;
    --primary-mild: #4996ff;
    --primary-subtle: #2a85ff1a;
    --error: #ff6a55;
    --error-subtle: #ff6a551a; 
    --success: #10b981;
    --success-subtle: #05eb7624;
    --info: #2a85ff;
    --info-subtle: #2a85ff1a;
    --warning: #f59e0b;
    --warning-subtle: #ffd40045;
    --gray-50: #fafafa;
    --gray-100: #f5f5f5;
    --gray-200: #e5e5e5;
    --gray-300: #d4d4d4;
    --gray-400: #a3a3a3;
    --gray-500: #737373;
    --gray-600: #525252;
    --gray-700: #404040;
    --gray-800: #262626;
    --gray-900: #171717;
    --gray-950: #0a0a0a;
}`}</SyntaxHighlighter>
            <div className="mt-10" id="dynamic-theme">
                <h5>تنظیم تم پویا</h5>
                <p className="mt-1">
                    اگر می‌خواهید قابلیت تغییر تم به‌صورت دینامیک را در برنامه خود فعال کنید، باید چند مرحله اضافی را انجام دهید. ابتدا، اسکیما (الگوی) تم خود را در فایل
                    <code>configs/theme.config.ts</code>
                    پیکربندی کنید:
                </p>
                <SyntaxHighlighter language="ts">{`export type Variables = 
  | "primary"
  | "primaryDeep"
  | "primaryMild"
  | "primarySubtle"
  | "neutral";

export type ThemeVariables = Record<
  "light" | "dark", 
  Record<Variables, string>
>

/** Default theme schema should corresponding to the CSS variables */
const defaultTheme: ThemeVariables = {
    light: {
        primary: "#2a85ff",
        primaryDeep: "#0069f6",
        primaryMild: "#4996ff",
        primarySubtle: "#2a85ff1a",
        neutral: "#ffffff",
    },
    dark: {
        primary: "#2a85ff",
        primaryDeep: "#0069f6",
        primaryMild: "#4996ff",
        primarySubtle: "#2a85ff1a",
        neutral: "#ffffff",
    },
}

/** Example of a custom green theme schema */
const greenTheme: ThemeVariables = {
    light: {
        primary: "#0CAF60",
        primaryDeep: "#088d50",
        primaryMild: "#34c779",
        primarySubtle: "#0CAF601a",
        neutral: "#ffffff",
    },
    dark: {
        primary: "#0CAF60",
        primaryDeep: "#088d50",
        primaryMild: "#34c779",
        primarySubtle: "#0CAF601a",
        neutral: "#ffffff",
    },
}

const presetThemeSchemaConfig: Record<string, ThemeVariables> = {
    default: defaultTheme,
    green: greenTheme,
}

export default presetThemeSchemaConfig`}</SyntaxHighlighter>
            </div>
            <p>
                حالا که اسکیماهای تم شما تنظیم شده‌اند، می‌توانید از هوک
                <code>useThemeStore</code>
                برای تغییر بین رنگ‌های مختلف تم استفاده کنید. در اینجا یک مثال از نحوه پیاده‌سازی یک سوئیچ‌کننده تم آمده است:
            </p>
            <SyntaxHighlighter language="tsx">{`import classNames from '@/utils/classNames'
import { TbCheck } from 'react-icons/tb'
import presetThemeSchemaConfig from '@/configs/preset-theme-schema.config'
import { useThemeStore } from '@/store/themeStore'

const ThemeSwitcher = () => {
    const schema = useThemeStore((state) => state.themeSchema)
    const setSchema = useThemeStore((state) => state.setSchema)
    const mode = useThemeStore((state) => state.mode)

    return (
        <div className="inline-flex items-center gap-2">
            {Object.entries(presetThemeSchemaConfig).map(([key, value]) => (
                <button
                    key={key}
                    className={classNames(
                        'h-8 w-8 rounded-full flex items-center justify-center border-2 border-white',
                        schema === key && 'ring-2 ring-primary',
                    )}
                    style={{ backgroundColor: value[mode].primary || '' }}
                    onClick={() => setSchema(key)}
                >
                    {schema === key ? (
                        <TbCheck className="text-neutral text-lg" />
                    ) : (
                        <></>
                    )}
                </button>
            ))}
        </div>
    )
}

export default ThemeSwitcher`}</SyntaxHighlighter>
            <p>
                این راهنما باید به شما کمک کند تا تم‌ها را به‌طور مؤثر در برنامه خود مدیریت و تغییر دهید. شما می‌توانید اسکیماهای تم را بر اساس نیازهای طراحی خود گسترش دهید.
            </p>
        </>
    )
}

export default ThemeColor
