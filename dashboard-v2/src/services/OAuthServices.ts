import { signInWithFirebaseGoogle } from './firebase/FirebaseGoogleAuth'
import { signInWithFirebaseGithub } from './firebase/FirebaseGithubAuth'

export async function apiGoogleOauthSignIn() {
    return await signInWithFirebaseGoogle()
}

export async function apiGithubOauthSignIn() {
    return await signInWithFirebaseGithub()
}
