import useChatSend from '../hooks/useChatSend'
import {
    PiLightbulbDuotone,
    PiBookOpenTextDuotone,
    PiCompassDuotone,
    PiCodeDuotone,
} from 'react-icons/pi'
import type { ReactNode } from 'react'

type PromptType = 'idea' | 'guide' | 'writing' | 'coding'

const suggeustionIcon: Record<PromptType, ReactNode> = {
    idea: <PiLightbulbDuotone className="text-blue-500" />,
    guide: <PiCompassDuotone className="text-emerald-500" />,
    writing: <PiBookOpenTextDuotone className="text-amber-500" />,
    coding: <PiCodeDuotone className="text-indigo-500" />,
}

const promptSuggestion: {
    title: string
    prompt: string
    type: PromptType
}[] = [
    {
        title: 'به من کمک کن تا برای یک سفر آینده مانند یک کارشناس به نظر برسم',
        prompt: `من این آخر هفته به تماشای نهنگ‌ها می‌روم و می‌خواهم درباره نهنگ‌های قاتل آگاه به نظر برسم. چند واقعیت منحصر به فرد و جالب به من بگویید که می‌توانم به اشتراک بگذارم.`,
        type: 'guide',
    },
    {
        title: 'یک ارائه فروش منطقی برای یک محصول جدید ترسیم کنید',
        prompt: `یک ارائه فروش برای یک سشوار که همچنین یک میکروفون است، ساختار دهید. مختصر باشید و ارائه فروش را به صورت منطقی سازماندهی کنید.`,
        type: 'writing',
    },
    {
        title: 'به من کمک کن با یک لیست از 10 نکته سازماندهی شوم',
        prompt: `10 نکته برای سازماندهی اتاق به من بدهید.`,
        type: 'idea',
    },
    {
        title: 'کد برای یک وظیفه خاص بنویسید، شامل موارد لبه',
        prompt: `یک تابع جاوا بنویسید که یک مسیر را به عنوان ورودی بگیرد و یک فایل ایجاد کند که تاریخ سیستم فعلی را ذخیره کند. موارد لبه را در نظر بگیرید.`,
        type: 'coding',
    },
]

const ChatLandingView = () => {
    const { handleSend } = useChatSend()

    return (
        <div className="max-w-[900px] w-full mx-auto mt-20">
            <div>
                <div className="heading-text text-4xl leading-snug">
                    <span className="font-semibold bg-gradient-to-r from-indigo-500 to-red-400 bg-clip-text text-transparent text-5xl">
                        سلام، آنجا
                    </span>
                    <br />
                    <span>چگونه می‌توانم امروز به شما کمک کنم؟</span>
                </div>
                <div className="mt-8 grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {promptSuggestion.map((suggestion) => (
                        <div
                            key={suggestion.title}
                            className="flex flex-col gap-4 justify-between rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-5 min-h-40 2xl:min-h-60 cursor-pointer"
                            role="button"
                            onClick={() => handleSend(suggestion.title)}
                        >
                            <h6 className="font-normal">{suggestion.title}</h6>
                            <div>
                                <div className="bg-white dark:bg-gray-800 rounded-full p-2 inline-flex">
                                    <span className="text-2xl">
                                        {suggeustionIcon[suggestion.type]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ChatLandingView
