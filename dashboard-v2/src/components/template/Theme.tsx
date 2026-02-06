import ConfigProvider from '@/components/ui/ConfigProvider'
import { themeConfig } from '@/configs/theme.config'
import useDarkMode from '@/utils/hooks/useDarkMode'
import useTheme from '@/utils/hooks/useTheme'
import type { CommonProps } from '@/@types/common'

const Theme = (props: CommonProps) => {
    useTheme()
    useDarkMode()

    return (
        <ConfigProvider
            value={{
                ...themeConfig,
            }}
        >
            {props.children}
        </ConfigProvider>
    )
}

export default Theme
