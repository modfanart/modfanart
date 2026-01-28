import { useState } from 'react'
import classNames from '@/utils/classNames'
import { motion, AnimatePresence } from 'framer-motion'
import { TbMinus, TbPlus } from 'react-icons/tb'

type QuestionProps = {
    title: string
    content: string
    defaultExpand: boolean
    border: boolean
    isFirstChild: boolean
}

const Question = (props: QuestionProps) => {
    const { title, content, defaultExpand, border, isFirstChild } = props

    const [expand, setExpand] = useState(defaultExpand)

    return (
        <div
            className={classNames(
                'flex flex-col w-full',
                border && 'border-b gray-200 dark:border-gray-700',
                isFirstChild ? 'pb-6' : 'py-6',
            )}
        >
            <div
                className="flex items-center gap-4 transition-colors h6 font-semibold cursor-pointer group"
                role="button"
                onClick={() => setExpand(!expand)}
            >
                <span className="text-2xl">
                    {expand ? <TbPlus /> : <TbMinus />}
                </span>
                <span className="group-hover:text-primary">{title}</span>
            </div>
            <AnimatePresence>
                {expand && (
                    <motion.div
                        className="mt-4 ltr:ml-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Question
