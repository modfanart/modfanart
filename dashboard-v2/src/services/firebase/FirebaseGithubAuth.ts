import { GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import FirebaseAuth from './FirebaseAuth'

const githubAuthProvider = new GithubAuthProvider()

export const signInWithFirebaseGithub = async () => {
    try {
        const resp = await signInWithPopup(FirebaseAuth, githubAuthProvider)
        const token = await resp.user.getIdToken()
        return {
            token,
            user: resp.user,
        }
    } catch (error) {
        throw new Error(`GitHub sign-in failed: ${error}`)
    }
}
