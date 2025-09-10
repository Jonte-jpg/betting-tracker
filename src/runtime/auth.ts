import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, indexedDBLocalPersistence } from 'firebase/auth'

export async function signInWithGoogle() {
  const auth = getAuth()
  await auth.setPersistence(indexedDBLocalPersistence)
  const provider = new GoogleAuthProvider()
  try {
    await signInWithPopup(auth, provider)
  } catch {
    await signInWithRedirect(auth, provider)
  }
}
