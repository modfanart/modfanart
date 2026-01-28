import { mock } from '../MockAdapter'
import { fileListData } from '../data/filesData'

const directoryList = fileListData.filter(
    (file) => file.fileType === 'directory',
)
const directoryIdList = directoryList.map((directory) => directory.id)

mock.onGet(`/api/files`).reply((config) => {
    const { id } = config.params
    let list = fileListData
    let filesIncluded: string[] = []
    let directory: { id: string; label: string }[] = []

    if (directoryList.some((directory) => directory.id === id)) {
        switch (id) {
            case '6':
                filesIncluded = ['2', '7', '8', '9', '15', '16']
                break
            case '12':
                filesIncluded = ['1', '2', '5']
                break
            case '18':
                filesIncluded = ['11', '13', '7', '4']
                break
            case '19':
                filesIncluded = ['15', '17', '3', '8', '7']
                break
            case '20':
                filesIncluded = ['3', '4', '10', '14']
                break
            default:
                break
        }
    }

    if (filesIncluded.length > 0) {
        list = fileListData.filter((file) => filesIncluded.includes(file.id))
        const dir = fileListData.find((file) => file.id === id)

        if (dir && directoryIdList.includes(id)) {
            directory = [{ id: dir.id, label: dir.name }]
        }
    }

    const resp = {
        list,
        directory: directory,
    }

    return [200, resp]
})
