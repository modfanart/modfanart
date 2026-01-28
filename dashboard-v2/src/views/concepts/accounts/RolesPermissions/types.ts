import type { KeyedMutator } from 'swr'

export type User = {
    id: string
    name: string
    email: string
    img: string
    role: string
    lastOnline: number
    status: string
}

export type Filter = {
    role?: string
    status?: string
}

export type Users = User[]

export type Role = {
    id: string
    name: string
    description: string
    users: Pick<User, 'id' | 'name' | 'email' | 'role' | 'img'>[]
    accessRight: Record<string, string[]>
}

export type Roles = Role[]

export type GetRolesPermissionsUsersResponse = {
    list: Users
    total: number
}

export type GetRolesPermissionsRolesResponse = Roles

export type MutateRolesPermissionsUsersResponse =
    KeyedMutator<GetRolesPermissionsUsersResponse>

export type MutateRolesPermissionsRolesResponse =
    KeyedMutator<GetRolesPermissionsRolesResponse>
