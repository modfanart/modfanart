/* eslint-disable react/no-unescaped-entities */
import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const Internationalization = () => {
    return (
        <>
            <p>
                اکمه از{' '}
                <a
                    rel="noopener"
                    target="_new"
                    href="https://react.i18next.com/"
                >
                    <strong>react-i18next</strong>
                </a>{' '}
                برای بین‌المللی‌سازی استفاده می‌کند، که مدیریت و ترجمه متن‌ها به زبان‌های مختلف را آسان می‌کند. فایل‌های مربوطه در دایرکتوری
                <code>src/locales/</code>
                قرار دارند.
            </p>
            <div className="mt-10" id="translatingText">
                <h5>ترجمه متن</h5>
                <p className="mt-1">
                    برای ترجمه متن‌ها درون کامپوننت‌های خود، می‌توانید از هوک
                    <code>useTranslation</code>
                    که توسط اکمه ارائه شده است، استفاده کنید. این هوک، <code>useTranslation</code> استاندارد از
                    <code>react-i18next</code>
                    را می‌پیچد و به شما این امکان را می‌دهد که از تابع ترجمه
                    <code>t</code>
                    برای ترجمه کلیدهای تعریف‌شده در فایل‌های زبان خود استفاده کنید.
                </p>
                <SyntaxHighlighter language="tsx">{`import { useTranslation } from '@/utils/hooks/useTranslation'

const Component = () => {

    const { t } = useTranslation()

    return (
        <div>{t('your.translate.key')}</div>
    )
}

export default Component`}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="changingLanguage">
                <h5>تغییر زبان</h5>
                <p className="mt-1">
                    اگر نیاز به تغییر زبان به‌طور داینامیک دارید، می‌توانید از شیء
                    <code>i18n</code>
                    که توسط هوک
                    <code>useTranslation</code>
                    ارائه شده است، برای تغییر زبان فعلی استفاده کنید.
                </p>
                <SyntaxHighlighter language="tsx">{`import { useTranslation } from 'react-i18next'

const Component = () => {

    const { i18n } = useTranslation()

    return (
        <button onClick={() => i18n.changeLanguage('fr')}>Change language</button>
    )
}

export default Component`}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="addNewLocale">
                <h5>افزودن زبان جدید</h5>
                <p className="mt-1">
                    تمام داده‌های زبان در مسیر{' '}
                    <code>src/locales/lang/*</code>
                    ذخیره می‌شوند. برای افزودن یک زبان جدید، یک فایل Json در این دایرکتوری ایجاد کنید. به عنوان مثال{' '}
                    <code>fr.json</code>
                </p>
                <SyntaxHighlighter language="json">{`{
    "your": {
        "translate": {
            "key": "votre clé de traduction"
        },
    }
}`}</SyntaxHighlighter>
                <p>
                    حالا می‌توانید این فایل را به{' '}
                    <code>src/locales/index.ts</code> وارد کرده و آن‌ها را به فیلد{' '}
                    <code>resources</code> اضافه کنید. این فایل ورودی تمام زبان‌ها است. همچنین، یک شیء برای بارگذاری زبان تاریخ به‌طور داینامیک از{' '}
                    <a
                        href="https://github.com/iamkun/dayjs/tree/dev/src/locale"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <code>dayjs</code>
                    </a>
                    ایجاد کنید.
                </p>
                <SyntaxHighlighter language="ts">{`import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './lang/en.json'
import fr from './lang/fr.json'

const resources = {
    en: {
        translation: en
    },
    fr: { // <--- this will be the value you use on changeLanguage method
        translation: fr
    },
}

// Consistent the key with resource to load relavant locale from day.js
export const dateLocales: {
    [key: string]: () => Promise<ILocale>;
} = {
    en: () => import('dayjs/locale/en'),
    fr: () => import('dayjs/locale/fr'),
}

`}</SyntaxHighlighter>
                <p>
                    و حالا زبان جدید به‌طور بنیادی تنظیم شده است.
                </p>
                <div className="mt-10" id="settingDefaultLanguage">
                    <h5>تنظیم زبان پیش‌فرض</h5>
                    <p className="mt-1">
                        برای تنظیم زبان پیش‌فرض، ممکن است نیاز باشد که به{' '}
                        <code>src/configs/app.config.ts</code> مراجعه کرده و مقدار فیلد{' '}
                        <code>locale</code> را تغییر دهید.
                    </p>
                </div>
                <SyntaxHighlighter language="ts">{`export const appConfig = {
    ...
    locale: 'fr'
}`}</SyntaxHighlighter>
            </div>
            <div className="mt-10" id="settingDefaultLanguage">
                <h5>حذف بین‌المللی‌سازی</h5>
                <p className="mt-1">
                    اگر نیاز به حذف بین‌المللی‌سازی یا غیرفعال کردن آن به هر دلیلی دارید، باید{' '}
                    <code>import './locales'</code> را از{' '}
                    <code>src/App.tsx</code> حذف کرده و استفاده از{' '}
                    <code>useTranslation</code> در کامپوننت‌های خود را نیز پاک کنید.
                </p>
                <SyntaxHighlighter language="ts">{`export const appConfig = {
    ...
    locale: 'fr'
}`}</SyntaxHighlighter>
            </div>
        </>
    )
}

export default Internationalization
