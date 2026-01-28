import { getFirestore } from 'firebase/firestore'
import FirebaseApp from './FirebaseApp'

const FirebaseDB = getFirestore(FirebaseApp)

export default FirebaseDB
