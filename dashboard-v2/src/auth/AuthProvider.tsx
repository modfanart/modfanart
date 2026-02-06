// src/auth/AuthProvider.tsx
import { createContext, useContext, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
} from '@/services/authApi'
import { useGetCurrentUserQuery } from '@/services/userApi'
import { setCredentials, logout } from '../services/features/authSlice' // adjust path if needed
import type { RootState } from '@/store'

import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'

import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
} from '@/@types/auth'

interface AuthContextValue {
    authenticated: boolean
    user: User | null
    isLoading: boolean
    signIn: (values: SignInCredential) => Promise<AuthResult>
    signUp: (values: SignUpCredential) => Promise<AuthResult>
    signOut: () => Promise<void>
    oAuthSignIn?: (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const { accessToken, user: storedUser } = useSelector(
        (s: RootState) => s.auth,
    )

    const { data: freshUser, isLoading: isUserLoading } =
        useGetCurrentUserQuery(undefined, {
            skip: !accessToken || !!storedUser,
        })

    const effectiveUser = freshUser || storedUser
    const authenticated = !!accessToken && !!effectiveUser && !isUserLoading

    const [login] = useLoginMutation()
    const [register] = useRegisterMutation()
    const [logoutApi] = useLogoutMutation()

    const getRedirectTarget = () => {
        const params = new URLSearchParams(location.search)
        return params.get(REDIRECT_URL_KEY) || appConfig.authenticatedEntryPath
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

    const signIn = async (values: SignInCredential): Promise<AuthResult> => {
        try {
            const res = await login({
                email: values.email,
                password: values.password,
            }).unwrap()
            handleSuccessfulAuth(res.accessToken, res.user)
            return { status: 'success', message: '' }
        } catch (err: any) {
            return {
                status: 'failed',
                message: err?.data?.message || 'Sign in failed',
            }
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
            return { status: 'success', message: '' }
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
            console.warn('Logout failed – clearing anyway', err)
        } finally {
            dispatch(logout())
            navigate(appConfig.unAuthenticatedEntryPath, { replace: true })
        }
    }

    const oAuthSignIn = (cb: (payload: OauthSignInCallbackPayload) => void) => {
        cb({
            onSignIn: (tokens, userData) => {
                if (tokens.accessToken && userData) {
                    handleSuccessfulAuth(tokens.accessToken, userData)
                }
            },
            redirect: () => navigate(getRedirectTarget(), { replace: true }),
        })
    }

    const value: AuthContextValue = {
        authenticated,
        user: effectiveUser,
        isLoading: isUserLoading,
        signIn,
        signUp,
        signOut,
        oAuthSignIn,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
