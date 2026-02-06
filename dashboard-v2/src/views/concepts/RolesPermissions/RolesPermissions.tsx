import Container from '@/components/shared/Container'
import RolesPermissionsGroups from './components/RolesPermissionsGroups'
import RolesPermissionsGroupsAction from './components/RolesPermissionsGroupsAction'
import RolesPermissionsUserAction from './components/RolesPermissionsUserAction'
import RolesPermissionsUserTable from './components/RolesPermissionsUserTable'
import RolesPermissionsUserSelected from './components/RolesPermissionsUserSelected'
import RolesPermissionsAccessDialog from './components/RolesPermissionsAccessDialog'
import useRolePermissonsUsers from './hooks/useRolePermissonsUsers'
import useRolePermissonsRoles from './hooks/useRolePermissonsRoles'

const RolesPermissions = () => {
    const {
        userList,
        userListTotal,
        isLoading: userLoading,
        mutate: userMutate,
    } = useRolePermissonsUsers()
    const { roleList, mutate: roleMutate } = useRolePermissonsRoles()

    return (
        <>
            <Container>
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3>نقش ها و مجوزها</h3>
                        <RolesPermissionsGroupsAction />
                    </div>
                    <div className="mb-10">
                        <RolesPermissionsGroups roleList={roleList} />
                    </div>
                </div>
                <div>
                    <div>
                        <div className="mb-6 flex flex-col gap-5">
                            <h3>همه حساب ها</h3>
                            <div className="flex-1">
                                <RolesPermissionsUserAction />
                            </div>
                        </div>
                        <RolesPermissionsUserTable
                            userList={userList}
                            userListTotal={userListTotal}
                            isLoading={userLoading}
                            mutate={userMutate}
                            roleList={roleList}
                        />
                    </div>
                </div>
            </Container>
            <RolesPermissionsAccessDialog
                roleList={roleList}
                mutate={roleMutate}
            />
            <RolesPermissionsUserSelected
                userList={userList}
                userListTotal={userListTotal}
                mutate={userMutate}
            />
        </>
    )
}

export default RolesPermissions
