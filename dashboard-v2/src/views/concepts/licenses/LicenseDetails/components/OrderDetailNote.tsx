import Card from '@/components/ui/Card'

type OrderDetailNoteProps = {
    note: string
}

const OrderDetailNote = ({ note }: OrderDetailNoteProps) => {
    return (
        <Card>
            <h4 className="mb-4">توجه داشته باشید</h4>
            <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-700 ">
                {note}
            </div>
        </Card>
    )
}

export default OrderDetailNote
