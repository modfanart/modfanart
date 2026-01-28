import { useEffect } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import MailList from './MailList'
import MailSidebar from './MailSidebar'
import MailDetail from './MailDetail'
import MailBodyTop from './MailBodyTop'
import useMail from '../hooks/useMail'
import useQuery from '@/utils/hooks/useQuery'
import { useMailStore } from '../store/mailStore'
import isEmpty from 'lodash/isEmpty'

const MailBody = () => {
    const query = useQuery()

    const id = query.get('mail')

    const { fetchMail } = useMail()

    const { mail } = useMailStore()

    useEffect(() => {
        if (id && isEmpty(mail)) {
            fetchMail(id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    return (
        <AdaptiveCard
            className="h-full border-0"
            bodyClass="h-full flex flex-col"
        >
            <div className="flex flex-auto h-full">
                <MailSidebar />
                <div className="ltr:lg:pl-6 rtl:lg:pr-6 flex-1">
                    <MailBodyTop />
                    <div className="relative h-[calc(100%-70px)]">
                        {isEmpty(mail) ? (
                            <MailList />
                        ) : (
                            <MailDetail mail={mail} />
                        )}
                    </div>
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default MailBody
