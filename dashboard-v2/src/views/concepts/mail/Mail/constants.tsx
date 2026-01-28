import {
    HiOutlineInbox,
    HiOutlinePaperAirplane,
    HiOutlinePencil,
    HiOutlineStar,
    HiOutlineTrash,
} from 'react-icons/hi'
import type { Group, Label } from './types'

export const groupList: Group[] = [
    { value: 'inbox', label: 'صندوق ورودی', icon: <HiOutlineInbox /> },
    { value: 'sentItem', label: 'آیتم ارسال شده', icon: <HiOutlinePaperAirplane /> },
    { value: 'draft', label: 'پیش‌نویس', icon: <HiOutlinePencil /> },
    { value: 'starred', label: 'برگزیده‌ها', icon: <HiOutlineStar /> },
    { value: 'deleted', label: 'حذف شده', icon: <HiOutlineTrash /> },    
]

export const labelList: Label[] = [
    {
        value: 'work',
        label: 'کار',
        bgClass: 'bg-rose-100 dark:bg-rose-100',
        dotClass: 'bg-rose-300',
    },
    {
        value: 'private',
        label: 'خصوصی',
        bgClass: 'bg-blue-100 dark:bg-blue-100',
        dotClass: 'bg-blue-300',
    },
    {
        value: 'important',
        label: 'مهم',
        bgClass: 'bg-purple-100 dark:bg-purple-100',
        dotClass: 'bg-purple-300',
    },    
]
