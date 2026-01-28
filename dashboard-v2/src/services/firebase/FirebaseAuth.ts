import { getAuth } from 'firebase/auth'
import FirebaseApp from './FirebaseApp'

const FirebaseAuth = getAuth(FirebaseApp)

export default FirebaseAuth
