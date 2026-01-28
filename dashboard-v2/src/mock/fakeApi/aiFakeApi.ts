import { mock } from '../MockAdapter'
import { chatHistoryData, imageData, generatedImageData } from '../data/aiData'
import uniqueId from 'lodash/uniqueId'
import dayjs from 'dayjs'

mock.onGet(`/api/ai/chat/history`).reply(() => {
    return [200, chatHistoryData]
})

mock.onPost(`/api/ai/chat`).reply((config) => {
    const { prompt } = JSON.parse(config.data as string) as { prompt: string }

    const userPrompt = prompt.toLocaleLowerCase()

    const responseContents = {
        regular: [
            `این یک پاسخ ساختگی است که برای شبیه‌سازی یک پاسخ تولید شده توسط هوش مصنوعی طراحی شده است. لطفاً توجه داشته باشید که این پاسخ توسط یک مدل هوش مصنوعی واقعی تولید نشده است. می‌توانید کلمات کلیدی 'title'، 'code'، 'list' را در درخواست خود بگنجانید تا انواع مختلفی از پاسخ‌های ساختگی دریافت کنید.`,
            `شما در حال مشاهده یک پاسخ ساختگی برای اهداف نمایشی هستید. این پیام توسط یک مدل هوش مصنوعی واقعی تولید نشده است، بلکه برای این دمو از پیش نوشته شده است. می‌توانید کلمات کلیدی 'title'، 'code'، 'list' را در درخواست خود بگنجانید تا انواع مختلفی از پاسخ‌های ساختگی دریافت کنید.`,
            `برای اهداف نمایشی، این پاسخ یک پیام ساختگی است. این نشان می‌دهد که یک پاسخ معمولی هوش مصنوعی چگونه ممکن است به نظر برسد، اما توسط یک هوش مصنوعی واقعی تولید نشده است. می‌توانید کلمات کلیدی 'title'، 'code'، 'list' را در درخواست خود بگنجانید تا انواع مختلفی از پاسخ‌های ساختگی دریافت کنید.`,
            `این پاسخ ساختگی بخشی از یک نمایش است و توسط یک هوش مصنوعی واقعی تولید نشده است. محتوای اینجا برای اهداف نمایشی از پیش تعریف شده است. می‌توانید کلمات کلیدی 'title'، 'code'، 'list' را در درخواست خود بگنجانید تا انواع مختلفی از پاسخ‌های ساختگی دریافت کنید.`,
            `به عنوان بخشی از این دمو، شما در حال مشاهده یک پاسخ ساختگی هستید. این متن توسط یک مدل هوش مصنوعی ایجاد نشده است، بلکه یک مثال از پیش نوشته شده برای نشان دادن عملکرد است. می‌توانید کلمات کلیدی 'title'، 'code'، 'list' را در درخواست خود بگنجانید تا انواع مختلفی از پاسخ‌های ساختگی دریافت کنید.`,
        ],
        title: 'این یک پاسخ ساختگی با عنوان است.\n\n###### عنوان مثال\n\nلطفاً توجه داشته باشید که این توسط یک مدل هوش مصنوعی واقعی تولید نشده است.',
        code: "این یک پاسخ ساختگی با یک قطعه کد است.\n\n```\nfunction example() {\n    console.log('این یک قطعه کد ساختگی است.');\n}\n```\n\nلطفاً توجه داشته باشید که این توسط یک مدل هوش مصنوعی واقعی تولید نشده است.",
        list: 'این یک پاسخ ساختگی با یک لیست است.\n\n1. آیتم اول\n2. آیتم دوم\n3. آیتم سوم\n\nلطفاً توجه داشته باشید که این توسط یک مدل هوش مصنوعی واقعی تولید نشده است.',
    }

    let content =
        responseContents.regular[
            Math.floor(Math.random() * responseContents.regular.length)
        ]

    if (userPrompt.includes('title')) {
        content = responseContents.title
    }
    if (userPrompt.includes('code')) {
        content = responseContents.code
    }
    if (userPrompt.includes('list')) {
        content = responseContents.list
    }

    const response = {
        id: uniqueId('ai-conversation-'),
        choices: [
            {
                finish_reason: 'stop',
                index: 0,
                message: {
                    content: content,
                    role: 'assistant',
                },
            },
        ],
        created: dayjs().unix(),
        model: 'gpt-4',
    }

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([200, response])
        }, 800)
    })
})

mock.onGet(`/api/ai/images`).reply((config) => {
    const { index, itemCount = 4 } = config.params

    let loadable = true
    const maxGetItem = itemCount
    const count = (index - 1) * maxGetItem
    let images = imageData
    if (count >= images.length) {
        loadable = false
    }
    images = images.slice(count, index * maxGetItem)
    const response = {
        data: images,
        loadable,
    }
    return [200, response]
})

mock.onPost(`/api/ai/images`).reply((config) => {
    const { prompt } = JSON.parse(config.data as string) as { prompt: string }

    const imageSet = generatedImageData[
        Math.floor(Math.random() * generatedImageData.length)
    ].map((img) => {
        img.prompt = prompt
        return img
    })

    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve([200, imageSet])
        }, 2000)
    })
})
