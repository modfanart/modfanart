import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import DebouceInput from '@/components/shared/DebouceInput'
import { useRolePermissionsStore } from '../store/rolePermissionsStore'
import { TbSearch } from 'react-icons/tb'
import { components } from 'react-select'
import type { ControlProps, OptionProps } from 'react-select'

const { Control } = components

type StatusOption = {
    label: string
    value: string
    dotBackground: string
}

type RoleOption = {
    label: string
    value: string
}

const statusOptions = [
    { label: 'همه', value: '', dotBackground: 'bg-gray-200' },
    { label: 'فعال', value: 'active', dotBackground: 'bg-success' },
    { label: 'مسدود شده', value: 'blocked', dotBackground: 'bg-error' },
]
const roleOptions = [
    { label: 'همه', value: '' },
    { label: 'مدیر', value: 'admin' },
    { label: 'سرپرست', value: 'supervisor' },
    { label: 'پشتیبان', value: 'support' },
    { label: 'کاربر', value: 'user' },
    { label: 'حسابرس', value: 'auditor' },
    { label: 'مهمان', value: 'guest' },
]

const StatusSelectOption = (props: OptionProps<StatusOption>) => {
    return (
        <DefaultOption<StatusOption>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Badge className={data.dotBackground} />
                    <span>{label}</span>
                </span>
            )}
        />
    )
}

const RoleSelectOption = (props: OptionProps<RoleOption>) => {
    return (
        <DefaultOption<RoleOption>
            {...props}
            customLabel={(_, label) => <span>{label}</span>}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<StatusOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <div className="flex mr-3">
                    <Badge className={selected.dotBackground} />
                </div>
            )}
            {children}
        </Control>
    )
}

const RolesPermissionsUserAction = () => {
    const { tableData, filterData, setFilterData, setTableData } =
        useRolePermissionsStore()

    const handleStatusChange = (status: string) => {
        setFilterData({ ...filterData, status })
    }

    const handleRoleChange = (role: string) => {
        setFilterData({ ...filterData, role })
    }

    const handleInputChange = (query: string) => {
        setTableData({ ...tableData, query })
    }

    return (
        <div className="flex items-center justify-between">
            <DebouceInput
                className="max-w-[300px]"
                placeholder="جستجو..."
                type="text"
                size="sm"
                prefix={<TbSearch className="text-lg" />}
                onChange={(e) => handleInputChange(e.target.value)}
            />
            <div className="flex items-center gap-2">
                <Select<StatusOption, false>
                    className="min-w-[150px] w-full"
                    components={{
                        Control: CustomControl,
                        Option: StatusSelectOption,
                    }}
                    options={statusOptions}
                    size="sm"
                    placeholder="Status"
                    defaultValue={{
                        label: 'همه',
                        value: '',
                        dotBackground: 'bg-gray-200',
                    }}
                    onChange={(option) =>
                        handleStatusChange(option?.value || '')
                    }
                />
                <Select<RoleOption>
                    className="min-w-[150px] w-full"
                    components={{
                        Option: RoleSelectOption,
                    }}
                    options={roleOptions}
                    size="sm"
                    placeholder="Role"
                    defaultValue={{ label: 'همه', value: '' }}
                    onChange={(option) => handleRoleChange(option?.value || '')}
                />
            </div>
        </div>
    )
}

export default RolesPermissionsUserAction
