```jsx
import { useState } from 'react'
import Switcher from '@/components/ui/Switcher'
import Alert from '@/components/ui/Alert'
import Loading from '@/components/shared/Loading'

const Cover = () => {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <>
            <div className="flex items-center mb-4 gap-2">
                <span>Loading State: </span>
                <Switcher
                    checked={isLoading}
                    onChange={(checked) => setIsLoading(checked)}
                />
            </div>
            <Loading loading={isLoading} type="cover">
                <Alert type="info" title="Alert!" showIcon>
                    توضیحات و اطلاعات بیشتر در مورد کپی رایتینگ.
                </Alert>
            </Loading>
        </>
    )
}

export default Cover
```
