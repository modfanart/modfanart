// src/auth/AuthContext.tsx
import { createContext } from 'react'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    User,
    OauthSignInCallbackPayload,
} from '@/@types/auth'

export type AuthContextType = {
    authenticated: boolean
    user: User | null
    isLoading: boolean // ← add this
    signIn: (values: SignInCredential) => Promise<AuthResult>
    signUp: (values: SignUpCredential) => Promise<AuthResult>
    signOut: () => Promise<void>
    oAuthSignIn: (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => void
}

const defaultFunctionPlaceHolder = async (): Promise<AuthResult> => ({
    status: 'failed',
    message: '',
})

const defaultOAuthSignInPlaceHolder = (
    callback: (payload: OauthSignInCallbackPayload) => void,
): void => {
    callback({ onSignIn: () => {}, redirect: () => {} })
}

const AuthContext = createContext<AuthContextType>({
    authenticated: false,
    user: null,
    isLoading: false, // ← add default
    signIn: defaultFunctionPlaceHolder,
    signUp: defaultFunctionPlaceHolder,
    signOut: async () => {},
    oAuthSignIn: defaultOAuthSignInPlaceHolder,
})
export default AuthContext
