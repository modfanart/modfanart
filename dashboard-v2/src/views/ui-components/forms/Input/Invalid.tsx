import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { HiExclamationCircle } from 'react-icons/hi'

const Invalid = () => {
    const [invalid, setInvalid] = useState(false)

    return (
        <div>
            <div className="mb-4">
                <Input
                    invalid={invalid}
                    placeholder="ورودی نامعتبر"
                    suffix={
                        invalid ? (
                            <HiExclamationCircle className="text-red-500 text-xl" />
                        ) : null
                    }
                />
            </div>
            <div className="mb-4">
                <Input
                    textArea
                    invalid={invalid}
                    placeholder="مربع متنی نامعتبر"
                />
            </div>
            <Button variant="solid" onClick={() => setInvalid(!invalid)}>
                تعیین {invalid ? 'معتبر' : 'نامعتبر'}
            </Button>
        </div>
    )
}

export default Invalid
