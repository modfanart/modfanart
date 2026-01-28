import { useMailStore } from '../store/mailStore'
import { apiGetMails, apiGetMail } from '@/services/MailServices'
import useSWRMutation from 'swr/mutation'
import type {
    GetMailsResponse,
    GetMailResponse,
    GetMailsRequest,
    GetMailRequest,
} from '../types'

async function getMails(
    _: string,
    { arg }: { arg: { category: string; label: string } },
) {
    const data = await apiGetMails<GetMailsResponse, GetMailsRequest>(arg)
    return data
}

async function getMail(_: string, { arg }: { arg: string }) {
    const data = await apiGetMail<GetMailResponse, GetMailRequest>({ id: arg })
    return data
}

const useMail = () => {
    const {
        setMailList,
        setMail,
        selectedMailId,
        setMailListFetched,
        setSelectedMail,
    } = useMailStore()

    const { trigger: fetchMails, isMutating: isMailsFetching } = useSWRMutation(
        `/api/mails/`,
        getMails,
        {
            onSuccess: (list) => {
                setSelectedMail([])
                setMailList(list)
                setMailListFetched(true)
            },
        },
    )

    const { trigger: fetchMail, isMutating: isMailFetching } = useSWRMutation(
        `/api/mail/${selectedMailId}`,
        getMail,
        {
            onSuccess: (mail) => {
                setMail(mail)
            },
        },
    )

    return {
        fetchMails,
        isMailsFetching,
        fetchMail,
        isMailFetching,
    }
}

export default useMail
