import { useState } from 'react'
import Switcher from '@/components/ui/Switcher'
import Loading from '@/components/shared/Loading'

const Basic = () => {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <>
            <div className="flex items-center mb-4 gap-2">
                <span>وضعیت بارگذاری: </span>
                <Switcher
                    checked={isLoading}
                    onChange={(checked) => setIsLoading(checked)}
                />
            </div>
            <Loading loading={isLoading}>
                <div className="text-center">اتمام بارگذاری</div>
            </Loading>
        </>
    )
}

export default Basic
