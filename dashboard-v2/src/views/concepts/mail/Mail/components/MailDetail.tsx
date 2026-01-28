import { useRef } from 'react'
import Card from '@/components/ui/Card'
import MailDetailTitle from './MailDetailTitle'
import MailDetailContent from './MailDetailContent'
import MailDetailAction from './MailDetailAction'
import isEmpty from 'lodash/isEmpty'
import type { Mail } from '../types'

type MailDetailProps = {
    mail?: Partial<Mail>
}

const MailDetail = ({ mail }: MailDetailProps) => {
    const scrollRef = useRef(null)

    const hasMailSelected = !isEmpty(mail)
    const cardHeaderProps = {
        ...(hasMailSelected
            ? {
                  header: {
                      content: <MailDetailTitle />,
                      extra: <MailDetailAction />,
                      className: 'bg-gray-100 dark:bg-gray-700 h-[100px]',
                  },
              }
            : {}),
    }

    return (
        <Card
            className="flex-1 h-full max-h-full dark:border-gray-700"
            bodyClass="h-full relative"
            {...cardHeaderProps}
        >
            <MailDetailContent ref={scrollRef} mail={mail} />
        </Card>
    )
}

export default MailDetail
