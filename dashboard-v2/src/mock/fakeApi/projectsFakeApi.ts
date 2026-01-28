import { mock } from '../MockAdapter'
import {
    scrumboardData,
    projectListData,
    projectDetailsData,
    tasksData,
    issueData,
} from '../data/projectsData'
import { usersData } from '../data/usersData'

mock.onGet(`/api/projects`).reply(() => {
    return [200, projectListData]
})

mock.onPost(`/api/projects`).reply((request) => {
    if (request.data.length > 0) {
        projectListData.push(JSON.parse(request.data))

        return [200, projectListData]
    }
    return [400, {}]
})

mock.onGet(/\/api\/projects\/\d+/).reply(function (config) {
    const id = config.url?.split('/')[2]
    let project = projectListData.find((product) => product.id === id)

    if (!project) {
        project = projectListData[0]
    }

    const projectDetails = { ...projectDetailsData, ...project }

    return [200, projectDetails]
})

mock.onGet(`/api/projects/scrum-board`).reply(() => {
    return [200, scrumboardData]
})

mock.onGet(`/api/projects/scrum-board/members`).reply(() => {
    const borderMembersId = ['3', '2', '4', '7', '1', '10', '9']
    const participantMembers = usersData.filter((user) =>
        borderMembersId.includes(user.id),
    )
    return [
        200,
        {
            participantMembers,
            allMembers: usersData,
        },
    ]
})

mock.onGet(`/api/projects/tasks`).reply(() => {
    return [200, tasksData]
})

mock.onGet(/\/api\/projects\/tasks\/\d+/).reply(function () {
    return [200, issueData]
})
