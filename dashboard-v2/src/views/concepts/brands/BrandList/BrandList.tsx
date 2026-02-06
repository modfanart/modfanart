import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import CustomerListTable from './components/BrandListTable'
import CustomerListActionTools from './components/BrandListActionTools'
import CustomersListTableTools from './components/BrandListTableTools'
import CustomerListSelected from './components/BrandListSelected'

const CustomerList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>مشتریان</h3>
                            <CustomerListActionTools />
                        </div>
                        <CustomersListTableTools />
                        <CustomerListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <CustomerListSelected />
        </>
    )
}

export default CustomerList
