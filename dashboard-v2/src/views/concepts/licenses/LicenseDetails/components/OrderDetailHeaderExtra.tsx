import { useParams, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'

const OrderDetailHeaderExtra = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    const handleEditClick = () => {
        navigate(`/concepts/orders/order-edit/${id}`)
    }

    return (
        <div className="flex items-center gap-2 print:hidden">
            <Button onClick={() => window.print()}>چاپ</Button>
            <Button variant="solid" onClick={handleEditClick}>
                ویرایش
            </Button>
        </div>
    )
}

export default OrderDetailHeaderExtra
