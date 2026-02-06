import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import OrderListTable from './components/OrderListTable'
import OrderListActionTools from './components/OrderListActionTools'
import OrderListTableTools from './components/OrderListTableTools'

const OrderList = () => {
    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>سفارشات</h3>
                        <OrderListActionTools />
                    </div>
                    <OrderListTableTools />
                    <OrderListTable />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default OrderList
