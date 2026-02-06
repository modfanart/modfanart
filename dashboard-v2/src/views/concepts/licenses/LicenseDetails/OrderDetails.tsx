import Loading from '@/components/shared/Loading'
import OrderDetailProducts from './components/OrderDetailProducts'
import OrderDetailPayment from './components/OrderDetailPayment'
import OrderDetailCustomer from './components/OrderDetailCustomer'
import OrderDetailsActivities from './components/OrderDetailsActivities'
import OrderDetailNote from './components/OrderDetailNote'
import { apiGetOrder } from '@/services/OrderService'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import type { GetOrderDetailsResponse } from './types'

const OrderDetails = () => {
    const { id } = useParams()

    const { data, isLoading } = useSWR<GetOrderDetailsResponse, { id: string }>(
        [`/api/project/${id}`],
        () => apiGetOrder({ id }),
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
        },
    )

    return (
        <Loading loading={isLoading}>
            {data && (
                <>
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="gap-4 flex flex-col flex-auto">
                            <OrderDetailProducts products={data.product} />
                            <OrderDetailPayment
                                paymentStatus={data.paymentStatus}
                                paymentSummary={data.paymentSummary}
                            />
                            <OrderDetailsActivities
                                activities={data.activity}
                                progressStatus={data.progressStatus}
                            />
                        </div>
                        <div className="lg:w-[320px] xl:w-[420px] gap-4 flex flex-col">
                            <OrderDetailCustomer customer={data.customer} />
                            <OrderDetailNote note={data.note} />
                        </div>
                    </div>
                </>
            )}
        </Loading>
    )
}

export default OrderDetails
