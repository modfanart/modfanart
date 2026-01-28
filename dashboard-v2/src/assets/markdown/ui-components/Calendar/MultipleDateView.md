```jsx
import { useState } from 'react'
import Calendar from '@/components/ui/Calendar'

const MultipleDateView = () => {
    const [value, setValue] = (useState < Date) | (null > null)

    return (
        <div className="overflow-x-auto ">
            <div className="w-[584x] mx-auto">
                <Calendar value={value} dateViewCount={2} onChange={setValue} />
            </div>
        </div>
    )
}

export default MultipleDateView
```
