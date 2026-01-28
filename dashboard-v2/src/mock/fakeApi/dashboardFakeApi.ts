import { mock } from '../MockAdapter'
import {
    eCommerceData,
    projectData,
    analyticsData,
    marketingData,
} from '../data/dashboardData'

mock.onGet(`/api/dashboard/ecommerce`).reply(() => {
    return [200, eCommerceData]
})

mock.onGet(`/api/dashboard/project`).reply(() => {
    const resp = {
        ...projectData,
    }

    return [200, resp]
})

mock.onGet(`/api/dashboard/analytic`).reply(() => {
    const resp = { ...analyticsData }

    return [200, resp]
})

mock.onGet(`/api/dashboard/marketing`).reply(() => {
    return [200, marketingData]
})
