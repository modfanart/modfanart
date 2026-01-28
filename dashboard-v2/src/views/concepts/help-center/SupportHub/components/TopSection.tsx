import { useRef } from 'react'
import Button from '@/components/ui/Button'
import Container from '@/components/shared/Container'
import { useHelpCenterStore } from '../store/helpCenterStore'
import { TbSearch } from 'react-icons/tb'

const TopSection = () => {
    const inputRef = useRef<HTMLInputElement>(null)

    const setQueryText = useHelpCenterStore((state) => state.setQueryText)
    const setSelectedTopic = useHelpCenterStore(
        (state) => state.setSelectedTopic,
    )

    const handleSetQueryText = () => {
        const value = inputRef.current?.value

        if (value) {
            setQueryText(inputRef.current?.value)
            setSelectedTopic('')
        }
    }

    return (
        <section className="flex flex-col justify-center h-[300px] bg-gradient-to-tr from-cyan-100 via-violet-100 to-fuchsia-100 dark:from-cyan-500 dark:via-violet-500 dark:to-fuchsia-500">
            <Container className="flex flex-col items-center px-4">
                <div className="mb-6 flex flex-col items-center">
                    <h2 className="mb-4 text-center">
                        مرکز پشتیبانی و کمک
                    </h2>
                    <p className="max-w-[350px] dark:text-gray-200 text-center">
                        برای پیدا کردن پاسخ‌ها، مرور سوالات متداول، و دسترسی به منابع پشتیبانی، همه چیز را در یک مکان پیدا کنید.
                    </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl min-h-[50px] px-3 flex flex-col bg-white max-w-[800px] w-full">
                    <div className="flex items-center gap-2 w-full h-[56px]">
                        <input
                            ref={inputRef}
                            className="flex-1 h-full placeholder:text-gray-400 placeholder:font-semibold font-semibold bg-transparent focus:outline-none heading-text"
                            placeholder="برای جستجوی مقاله تایپ کنید"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSetQueryText()
                                }

                                if (
                                    event.key === 'Backspace' &&
                                    (event.target as HTMLInputElement).value
                                        .length <= 1
                                ) {
                                    setQueryText('')
                                }
                            }}
                        />
                        <Button
                            size="xs"
                            shape="circle"
                            variant="solid"
                            icon={<TbSearch />}
                            onClick={handleSetQueryText}
                        />
                    </div>
                </div>
            </Container>
        </section>
    )
}

export default TopSection
