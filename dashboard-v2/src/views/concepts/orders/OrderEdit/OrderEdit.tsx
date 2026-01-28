import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Container from '@/components/shared/Container'
import Loading from '@/components/shared/Loading'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import OrderForm from '../OrderForm'
import sleep from '@/utils/sleep'
import { apiGetOrder } from '@/services/OrderService'
import useSWR from 'swr'
import { useParams, useNavigate } from 'react-router-dom'
import { TbTrash } from 'react-icons/tb'
import type { OrderFormSchema } from '../OrderForm'

type GetOrderDetailsResponse = {
    id: string
    progressStatus: number
    paymentStatus: number
    dateTime: number
    paymentSummary: {
        subTotal: number
        tax: number
        deliveryFees: number
        total: number
        customerPayment: number
    }
    note: string
    shipping: {
        deliveryFees: number
        estimatedMin: number
        estimatedMax: number
        shippingLogo: string
        shippingVendor: string
    }
    product: {
        id: string
        name: string
        productCode: string
        img: string
        price: number
        quantity: number
        total: number
        details: Record<string, string[]>
    }[]
    activity: {
        date: number
        events: {
            time: number
            action: string
            recipient?: string
        }[]
    }[]
    customer: {
        name: string
        firstName: string
        lastName: string
        email: string
        phone: string
        dialCode: string
        phoneNumber: string
        img: string
        previousOrder: number
        country: string
        address: string
        postcode: string
        city: string
    }
}

const OrderEdit = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    const { data, isLoading } = useSWR<GetOrderDetailsResponse, { id: string }>(
        [`/api/project/${id}`],
        () => apiGetOrder({ id }),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    const [discardConfirmationOpen, setDiscardConfirmationOpen] =
        useState(false)
    const [isSubmiting, setIsSubmiting] = useState(false)

    const handleFormSubmit = async (values: OrderFormSchema) => {
        console.log('Submitted values', values)
        setIsSubmiting(true)
        await sleep(800)
        setIsSubmiting(false)
        toast.push(
            <Notification type="success">
                سفارش: #{data?.id} به روز شد!
            </Notification>,
            { placement: 'top-center' },
        )
        navigate('/concepts/orders/order-list')
    }

    const handleConfirmDiscard = () => {
        setDiscardConfirmationOpen(true)
        toast.push(<Notification type="success">سفارش حذف شد!</Notification>, {
            placement: 'top-center',
        })
        navigate('/concepts/orders/order-list')
    }

    const handleDelete = () => {
        setDiscardConfirmationOpen(true)
    }

    const handleCancel = () => {
        setDiscardConfirmationOpen(false)
    }

    const orderFormProps = useMemo(() => {
        const products = data
            ? data.product.map(
                ({ id, name, productCode, img, price, quantity }) => {
                    return {
                        id,
                        name,
                        productCode,
                        img,
                        price,
                        quantity,
                        stock: 0,
                    }
                },
            )
            : []

        const defaultValues = {
            firstName: data?.customer.name || '',
            lastName: data?.customer.lastName || '',
            email: data?.customer.email || '',
            dialCode: data?.customer.dialCode || '',
            phoneNumber: data?.customer.phoneNumber || '',
            country: data?.customer.country || '',
            address: data?.customer.address || '',
            postcode: data?.customer.postcode || '',
            city: data?.customer.city || '',
            paymentMethod: 'paypal',
            paypalEmail: data?.customer.email,
        } as OrderFormSchema

        return {
            defaultProducts: products,
            defaultValues,
        }
    }, [data])

    return (
        <Loading loading={isLoading}>
            <OrderForm onFormSubmit={handleFormSubmit} {...orderFormProps}>
                <Container>
                    <div className="flex items-center justify-between px-8">
                        <span></span>
                        <div className="flex items-center">
                            <Button
                                className="ltr:mr-3 rtl:ml-3"
                                type="button"
                                customColorClass={() =>
                                    'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent'
                                }
                                icon={<TbTrash />}
                                onClick={handleDelete}
                            >
                                حذف
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isSubmiting}
                            >
                                به روز رسانی
                            </Button>
                        </div>
                    </div>
                </Container>
            </OrderForm>
            <ConfirmDialog
                isOpen={discardConfirmationOpen}
                type="danger"
                title="تغییرات را کنار بگذارید"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDiscard}
            >
                <p>
                    آیا مطمئن هستید که می خواهید این را حذف کنید؟ این عمل نمی تواند باشد
                    لغو کردن.{' '}
                </p>
            </ConfirmDialog>
        </Loading>
    )
}

export default OrderEdit
