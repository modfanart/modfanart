import type { ButtonHTMLAttributes } from 'react'

const ActionButton = ({
    children,
    ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            className="outline-none rounded-full p-2 text-xl bg-white dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-400 hover:text-gray-800 dark:text-gray-200 dark:hover:text-gray-100"
            {...rest}
        >
            {children}
        </button>
    )
}

export default ActionButton
