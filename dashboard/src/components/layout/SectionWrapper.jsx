
import { cn } from '@/lib/utils'

export default function SectionWrapper({
    children,
    className,
    theme = 'light',
    as: Component = 'section',
}) {
    const themes = {
        light: 'bg-white text-neutral-950',
        dark: 'bg-neutral-950 text-white',
        muted: 'bg-[#f7f7f5] text-neutral-950',
        transparent: 'bg-transparent',
    }

    return (
        <Component
            className={cn(
                'w-full',
                themes[theme] || themes.light,
                className,
            )}
        >
            {children}
        </Component>
    )
}

