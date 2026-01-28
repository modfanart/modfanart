import ConfirmDialog from '@/components/shared/ConfirmDialog'

type MailDeleteConfimationProps = {
    isOpen: boolean
    onClose: () => void
    onConfirmDelete: () => void
    selectedMailCount: number
}

const MailDeleteConfimation = ({
    isOpen,
    onClose,
    onConfirmDelete,
    selectedMailCount,
}: MailDeleteConfimationProps) => {
    return (
        <ConfirmDialog
            isOpen={isOpen}
            type="danger"
            title="حذف ایمیل"
            onClose={onClose}
            onRequestClose={onClose}
            onCancel={onClose}
            onConfirm={onConfirmDelete}
        >
            <p>
                آیا مطمئن هستید که می‌خواهید{' '}
                {selectedMailCount > 1
                    ? `${selectedMailCount} ایمیل از این ایمیل‌ها`
                    : 'این ایمیل'}{' '}
                را حذف کنید؟ این اقدام قابل بازگشت نیست.{' '}
            </p>
        </ConfirmDialog>
    )
}

export default MailDeleteConfimation
