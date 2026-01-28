import { mock } from '../MockAdapter'
import { calendarData } from '../data/calendarData'

mock.onGet(`/api/calendar`).reply(() => {
    return [200, calendarData]
})
