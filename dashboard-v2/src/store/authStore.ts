// src/store/authStore.ts  (or wherever this file lives)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import cookiesStorage from '@/utils/cookiesStorage'
import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE } from '@/constants/api.constant'
import type { User } from '@/@types/auth'

// ────────────────────────────────────────────────
//  Storage Helper (used by both session & token)
const getStorage = () => {
    const strategy = appConfig.accessTokenPersistStrategy

    if (strategy === 'localStorage') {
        return localStorage
    }
    if (strategy === 'sessionStorage') {
        return sessionStorage
    }
    // fallback to cookies (your custom implementation)
    return cookiesStorage
}

// ────────────────────────────────────────────────
// Session / User Store (persistent)
interface Session {
    signedIn: boolean
}

interface AuthState {
    session: Session
    user: User
}

interface AuthActions {
    setSessionSignedIn: (signedIn: boolean) => void
    setUser: (user: Partial<User>) => void
    resetSession: () => void
}

const initialUser: User = {
    avatar: '',
    userName: '',
    email: '',
    authority: [],
    // add any other required User fields here
}

const initialState: AuthState = {
    session: {
        signedIn: false,
    },
    user: initialUser,
}

export const useSessionUser = create<AuthState & AuthActions>()(
    persist(
        (set) => ({
            ...initialState,

            setSessionSignedIn: (signedIn) =>
                set((state) => ({
                    session: {
                        ...state.session,
                        signedIn,
                    },
                })),

            setUser: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        ...payload,
                    },
                })),

            resetSession: () =>
                set({
                    session: { signedIn: false },
                    user: initialUser,
                }),
        }),
        {
            name: 'session-user-storage', // unique storage key
            storage: createJSONStorage(getStorage), // respects appConfig strategy
            partialize: (state) => ({
                // only persist these fields (optional optimization)
                session: state.session,
                user: state.user,
            }),
        },
    ),
)

// ────────────────────────────────────────────────
// Token Store (also persistent + reactive)
interface TokenState {
    token: string | null
    setToken: (token: string | null) => void
    clearToken: () => void
}

export const useTokenStore = create<TokenState>()(
    persist(
        (set) => {
            // Initial value read once at store creation
            const storage = getStorage()
            const initialToken = storage.getItem(TOKEN_NAME_IN_STORAGE) ?? null

            return {
                token: initialToken,

                setToken: (token) => {
                    const storage = getStorage()
                    if (token) {
                        storage.setItem(TOKEN_NAME_IN_STORAGE, token)
                    } else {
                        storage.removeItem(TOKEN_NAME_IN_STORAGE)
                    }
                    set({ token })
                },

                clearToken: () => {
                    const storage = getStorage()
                    storage.removeItem(TOKEN_NAME_IN_STORAGE)
                    set({ token: null })
                },
            }
        },
        {
            name: 'auth-token-storage', // unique key
            storage: createJSONStorage(getStorage),
        },
    ),
)

// Convenience hook that most components will use
export const useToken = () => useTokenStore()

// Optional: combined hook if you often need both
export const useAuth = () => {
    const { session, user, setSessionSignedIn, setUser, resetSession } =
        useSessionUser()
    const { token, setToken, clearToken } = useToken()

    const authenticated = Boolean(token && session.signedIn)

    return {
        authenticated,
        token,
        user,
        session,
        setToken,
        clearToken,
        setSessionSignedIn,
        setUser,
        resetSession,
    }
}
