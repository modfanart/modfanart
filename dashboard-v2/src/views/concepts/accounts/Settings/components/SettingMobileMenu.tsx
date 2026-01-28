import { useRef } from 'react'
import ToggleDrawer from '@/components/shared/ToggleDrawer'
import SettingsMenu from './SettingsMenu'
import type { ToggleDrawerRef } from '@/components/shared/ToggleDrawer'

const SettingMobileMenu = () => {
    const drawerRef = useRef<ToggleDrawerRef>(null)

    return (
        <>
            <div>
                <ToggleDrawer ref={drawerRef} title="ناوبری">
                    <SettingsMenu
                        onChange={() => {
                            drawerRef.current?.handleCloseDrawer()
                        }}
                    />
                </ToggleDrawer>
            </div>
        </>
    )
}

export default SettingMobileMenu
