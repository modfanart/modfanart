import { useState, useRef, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { TbCheck, TbX } from 'react-icons/tb'

const ArticleAction = () => {
    const commentInput = useRef<HTMLInputElement>(null)

    const [helpful, setHelpful] = useState('')

    const onHelpfulClick = useCallback((val: string) => {
        setHelpful(val)
    }, [])

    const onCommentSubmit = () => {
        if (commentInput.current) {
            commentInput.current.value = ''
        }
    }

    return (
        <>
            <Card
                bordered
                className="mt-8"
                bodyClass="flex items-center justify-between"
            >
                <div>
                    <h5>آیا این مقاله مفید بود؟</h5>
                    <p>
                        {helpful === 'Y' ? '1' : '0'} از{' '}
                        {helpful === 'Y' ? '1' : '0'} نفر این را مفید دانستند
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        icon={helpful === 'Y' && <TbCheck />}
                        variant={helpful === 'Y' ? 'solid' : 'default'}
                        onClick={() => onHelpfulClick('Y')}
                    >
                        <span>بله</span>
                    </Button>
                    <Button
                        icon={helpful === 'N' && <TbX />}
                        variant={helpful === 'N' ? 'solid' : 'default'}
                        onClick={() => onHelpfulClick('N')}
                    >
                        <span>خیر</span>
                    </Button>
                </div>
            </Card>
            <div className="mt-12">
                <h3 className="mb-4">نظرات</h3>
                <Input
                    ref={commentInput}
                    textArea
                    placeholder="نظر خود را اینجا وارد کنید..."
                />
                <div className="mt-3 flex justify-end">
                    <Button variant="solid" onClick={onCommentSubmit}>
                        ارسال
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ArticleAction
