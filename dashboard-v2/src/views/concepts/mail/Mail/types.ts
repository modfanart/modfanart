export type Category = {
    category: string
    value?: string
    label?: string
}

export type Message = {
    id: number
    name: string
    mail: string[]
    from: string
    avatar: string
    date: string
    content: string
    attachment: {
        file: string
        size: string
        type: string
    }[]
}

export type Mail = {
    id: string
    name: string
    label: string
    group: string
    flagged: boolean
    starred: boolean
    from: string
    avatar: string
    title: string
    mail: string[]
    message: Message[]
    checked: boolean
}

export type MenuBase = {
    value: string
    label: string
}

export type Group = MenuBase & {
    icon: JSX.Element
}

export type Label = MenuBase & {
    bgClass: string
    dotClass: string
}

export type GetMailsRequest = Category

export type GetMailsResponse = Mail[]

export type GetMailRequest = { id: string }

export type GetMailResponse = Mail
