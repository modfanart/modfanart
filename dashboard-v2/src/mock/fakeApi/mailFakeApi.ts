import { mock } from '../MockAdapter'
import { mailData } from '../data/mailData'

mock.onGet(`/api/mails`).reply((config) => {
    const { category, label } = config.params
    let response = mailData

    if (category && category !== 'inbox') {
        response = mailData.filter((mail) => mail.group === category)
    }

    if (label) {
        response = mailData.filter((mail) => mail.label === label)
    }

    return [200, response]
})

mock.onGet(new RegExp(`/api/mails/*`)).reply(function (config) {
    const urlSegment = config.url?.split('/')
    const id = urlSegment?.[(urlSegment?.length || 0) - 1]
    const mail = mailData.find((mail) => mail.id === id)

    if (!mail) {
        return [404, {}]
    }

    return [200, mail]
})
