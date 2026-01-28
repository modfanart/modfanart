import SyntaxHighlighter from '@/components/shared/SyntaxHighlighter'

const DarkLightMode = () => {
    return (
        <>
            <p>
                برای راه‌اندازی حالت تاریک یا روشن در برنامه، کافی است فیلد{' '}
                <code>mode</code> را به{' '}
                <code>&apos;light&apos;</code> یا <code>&apos;dark&apos;</code> در{' '}
                <code>src/configs/theme.config.ts</code> تنظیم کنید. برای مثال:
            </p>
            <SyntaxHighlighter language="ts">{`export const themeConfig = {
    ...
    mode: 'dark'
}`}</SyntaxHighlighter>
            <div className="mt-10" id="hook">
                <h5>هوک</h5>
                <p className="mt-1">
                    شما می‌توانید از طریق هوک آماده‌ی ما به حالت دسترسی پیدا کرده یا آن را به‌روزرسانی کنید.
                </p>
                <SyntaxHighlighter language="tsx">{`import React from 'react'
import Switcher from '@/components/ui/Switcher'
import useDarkMode from '@/utils/hooks/useDarkMode'

const ModeSwitcher = () => {

    const [isDark, setIsDark] = useDarkMode()

    const onSwitchChange = (checked: boolean) => {
        setIsDark(checked ? 'dark' : 'light')
    }

    return (
        <div>
            <Switcher 
                value={isDark}
                onChange={checked => onSwitchChange(checked)}
            />
        </div>
    )
}

export default ModeSwitcher`}</SyntaxHighlighter>
            </div>
        </>
    )
}

export default DarkLightMode
