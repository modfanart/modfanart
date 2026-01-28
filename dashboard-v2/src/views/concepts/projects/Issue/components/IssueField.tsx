import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'

export interface IssueFieldProps extends CommonProps {
    title: string
    icon: ReactNode
}

const IssueField = (props: IssueFieldProps) => {
    const { title, icon, children } = props

    return (
        <div className="flex items-center mb-2">
            <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 min-w-[150px]">
                <span className="text-lg">{icon}</span>
                <span>{title}</span>
            </div>
            {children}
        </div>
    )
}

export default IssueField
