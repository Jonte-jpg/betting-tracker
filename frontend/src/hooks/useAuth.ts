import { useState, useEffect } from 'react'
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/lib/firebase'
import type { FirebaseUser } from '@/types/Firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Create or update user profile in Firestore
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        
        const userData: FirebaseUser = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: userSnap.exists() ? userSnap.data().createdAt : new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: userSnap.exists() 
            ? userSnap.data().preferences 
            : { defaultCurrency: 'SEK' }
        }
        
        if (userSnap.exists()) {
          // Update last login
          await updateDoc(userRef, {
            lastLoginAt: userData.lastLoginAt,
            displayName: userData.displayName,
            photoURL: userData.photoURL
          })
        } else {
          // Create new user document
          await setDoc(userRef, userData)
        }
        
        setUserProfile(userData)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateUserPreferences = async (preferences: Partial<FirebaseUser['preferences']>) => {
    if (!user || !userProfile) return
    
    const userRef = doc(db, 'users', user.uid)
    const updatedPreferences = { ...userProfile.preferences, ...preferences }
    
    await updateDoc(userRef, {
      preferences: updatedPreferences
    })
    
    setUserProfile({
      ...userProfile,
      preferences: updatedPreferences
    })
  }

  return {
    user,
    userProfile,
    loading,
    loginWithGoogle,
    logout,
    updateUserPreferences
  }
}
