import { useMemo, lazy } from 'react'
import {
    LAYOUT_COLLAPSIBLE_SIDE,
    LAYOUT_STACKED_SIDE,
    LAYOUT_TOP_BAR_CLASSIC,
    LAYOUT_FRAMELESS_SIDE,
    LAYOUT_CONTENT_OVERLAY,
    LAYOUT_BLANK,
} from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'
import type { LazyExoticComponent } from 'react'
import type { LayoutType } from '@/@types/theme'

type Layouts = Record<
    string,
    LazyExoticComponent<<T extends CommonProps>(props: T) => JSX.Element>
>

interface PostLoginLayoutProps extends CommonProps {
    layoutType: LayoutType
}

const layouts: Layouts = {
    [LAYOUT_COLLAPSIBLE_SIDE]: lazy(
        () => import('./components/CollapsibleSide'),
    ),
    [LAYOUT_STACKED_SIDE]: lazy(() => import('./components/StackedSide')),
    [LAYOUT_TOP_BAR_CLASSIC]: lazy(() => import('./components/TopBarClassic')),
    [LAYOUT_FRAMELESS_SIDE]: lazy(() => import('./components/FrameLessSide')),
    [LAYOUT_CONTENT_OVERLAY]: lazy(() => import('./components/ContentOverlay')),
    [LAYOUT_BLANK]: lazy(() => import('./components/Blank')),
}

const PostLoginLayout = ({ layoutType, children }: PostLoginLayoutProps) => {
    const AppLayout = useMemo(() => {
        if (!layouts[layoutType]) {
            return layouts[Object.keys(layouts)[0]]
        }

        return layouts[layoutType]
    }, [layoutType])

    return <AppLayout>{children}</AppLayout>
}

export default PostLoginLayout
