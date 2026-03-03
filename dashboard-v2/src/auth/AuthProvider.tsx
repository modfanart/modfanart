// src/auth/AuthProvider.tsx
import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
} from '@/services/authApi'
import { useGetCurrentUserQuery } from '@/services/userApi'

import {
    setCredentials,
    logout,
    type AuthState,
} from '@/services/features/authSlice'
import type { RootState } from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import type { User } from '@/services/authApi'

import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
} from '@/@types/auth'

interface AuthContextValue {
    authenticated: boolean
    user: User | null
    isLoading: boolean
    signIn: (values: SignInCredential) => Promise<AuthResult>
    signUp: (values: SignUpCredential) => Promise<AuthResult>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

// Helper to map API response to User
function mapCurrentUserResponseToUser(resp: any): User {
    return {
        id: resp.id,
        username: resp.username,
        email: resp.email,
        email_verified: resp.email_verified,
        role_id: resp.role_id,
        status: resp.status,
        profile: resp.profile,
        avatar_url: resp.avatar_url,
        banner_url: resp.banner_url,
        bio: resp.bio,
        location: resp.location,
        website: resp.website,
        payout_method: resp.payout_method,
        stripe_connect_id: resp.stripe_connect_id,
        last_login_at: resp.last_login_at,
        created_at: resp.created_at,
        updated_at: resp.updated_at,
        deleted_at: resp.deleted_at,
        /** ADD THIS */
        authority: resp.authority ?? resp.role?.authority ?? null,
    }
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const { accessToken, user: storedUser } = useSelector(
        (state: RootState) => state.auth,
    ) as AuthState

    const shouldFetchUser = !!accessToken && !storedUser

    const { data: freshUser, isLoading: isUserLoading } =
        useGetCurrentUserQuery(undefined, { skip: !shouldFetchUser })

    // Normalize freshUser to full User type
    const effectiveUser: User | null = freshUser
        ? mapCurrentUserResponseToUser(freshUser)
        : storedUser

    const authenticated = !!accessToken && !!effectiveUser && !isUserLoading

    const [login, { isLoading: isLoginLoading }] = useLoginMutation()
    const [register] = useRegisterMutation()
    const [logoutApi] = useLogoutMutation()

    const getRedirectTarget = () => {
        const searchParams = new URLSearchParams(location.search)
        const from = searchParams.get(REDIRECT_URL_KEY)
        return from || appConfig.authenticatedEntryPath || '/dashboard'
    }

    const handleSuccessfulAuth = (accessToken: string, userData: User) => {
        dispatch(
            setCredentials({
                accessToken,
                user: userData,
                persist: true,
            }),
        )
        navigate(getRedirectTarget(), { replace: true })
    }

    const signIn = async (
        credentials: SignInCredential,
    ): Promise<AuthResult> => {
        try {
            const response = await login(credentials).unwrap()

            if (!response?.accessToken || !response?.user) {
                throw new Error('Invalid response from server')
            }

            handleSuccessfulAuth(response.accessToken, response.user)

            return { status: 'success', message: 'Signed in successfully' }
        } catch (err: any) {
            let message = 'Login failed. Please try again.'

            if (err?.data?.message) {
                message = err.data.message
            } else if (err?.status === 401) {
                message = 'Invalid email or password'
            } else if (err?.status === 403) {
                message = 'Account not verified or suspended'
            } else if (err?.status >= 500) {
                message = 'Server error — please try again later'
            }

            return { status: 'failed', message }
        }
    }

    const signUp = async (values: SignUpCredential): Promise<AuthResult> => {
        try {
            const res = await register({
                username: values.userName || values.email.split('@')[0],
                email: values.email,
                password: values.password,
            }).unwrap()

            handleSuccessfulAuth(res.accessToken, res.user)
            return {
                status: 'success',
                message: 'Account created successfully',
            }
        } catch (err: any) {
            return {
                status: 'failed',
                message: err?.data?.message || 'Sign up failed',
            }
        }
    }

    const signOut = async () => {
        try {
            await logoutApi().unwrap()
        } catch (err) {
            console.warn('Logout API failed — clearing local state anyway', err)
        } finally {
            dispatch(logout())
            navigate(appConfig.unAuthenticatedEntryPath || '/sign-in', {
                replace: true,
            })
        }
    }

    const value = useMemo(
        () => ({
            authenticated,
            user: effectiveUser,
            isLoading: isUserLoading || isLoginLoading,
            signIn,
            signUp,
            signOut,
        }),
        [authenticated, effectiveUser, isUserLoading, isLoginLoading],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
