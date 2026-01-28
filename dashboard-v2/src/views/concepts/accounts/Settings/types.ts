export type View =
    | 'profile'
    | 'security'
    | 'notification'
    | 'billing'
    | 'integration'

export type CreditCard = {
    cardHolderName: string
    cardType: string
    expMonth: string
    expYear: string
    last4Number: string
    primary: boolean
}

export type CreditCardInfo = { cardId: string } & CreditCard

export type Integration = {
    id: string
    name: string
    desc: string
    img: string
    type: string
    active: boolean
    installed?: boolean
}

export type GetSettingsProfileResponse = {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    img: string
    location: string
    address: string
    postcode: string
    city: string
    country: string
    dialCode: string
    birthday: string
    phoneNumber: string
}

export type GetSettingsNotificationResponse = {
    email: string[]
    desktop: boolean
    unreadMessageBadge: boolean
    notifymeAbout: string
}

export type GetSettingsBillingResponse = {
    paymentMethods: Array<CreditCardInfo>
    transactionHistory: Array<{
        id: string
        item: string
        status: string
        amount: number
        date: number
    }>
    currentPlan: {
        plan: string
        status: string
        billingCycle: string
        nextPaymentDate: number
        amount: number
    }
}

export type GetSettingsIntegrationResponse = Integration[]
