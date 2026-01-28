import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import FirebaseAuth from './FirebaseAuth'

const googleAuthProvider = new GoogleAuthProvider()

export const signInWithFirebaseGoogle = async () => {
    try {
        const resp = await signInWithPopup(FirebaseAuth, googleAuthProvider)
        const token = await resp.user.getIdToken()
        return {
            token,
            user: resp.user,
        }
    } catch (error) {
        throw new Error(`Google sign-in failed: ${error}`)
    }
}
