/*
Primenicu na kontekst znanje iz knjige, sredicu performans, 
pogledacu koja su sva rerenderovanja zbog promene state-a
ostavicu neke komentare mozda u zavrsnoj verziji kako bi videli kako sam razmisljala
*/
import { auth, firestore, doc, updateDoc, onAuthStateChanged, signOut } from "../api/firebase"
import { useState, useEffect, createContext, useContext } from "react"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [authError, setAuthError] = useState(null)

    useEffect(() => {
        setAuthLoading(true)
        setAuthError(null)

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user) 
            setAuthLoading(false)
        }, (error) => {
            console.error(error)  

            let errorMessage
            if (error.code === "auth/network-request-failed") {
              errorMessage = "Network error. Please check your internet connection."
            } else if (error.code === "auth/too-many-requests") {
              errorMessage = "Too many requests. Please try again later."
            } else if (error.code === "auth/user-disabled") {
              errorMessage = "Your account has been disabled. Please contact support."
            } else if (error.code === "auth/invalid-api-key") {
              errorMessage = "Invalid API key. Please contact support."
            } else {
              errorMessage = "Failed to authenticate. Please try again later."
            }

            setAuthError(errorMessage)
            setAuthLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const logOut = async () => {
        setAuthLoading(true)
        setAuthError(null)

        try {
            const user = auth.currentUser
            if(user) {
                const uid = user.uid
                const userRef = doc(firestore, 'profiles', uid)
                await updateDoc(userRef, {isActive: false})
                await signOut(auth)
                setUser(null)
                console.log("Korisnik odjavljen.")
            }
        } catch(error) {
            console.error("Error during logout:", error.message)

            let errorMessage
            if (error.code === "auth/network-request-failed") {
              errorMessage = "Network error. Please check your internet connection."
            } else if (error.code === "auth/too-many-requests") {
              errorMessage = "Too many requests. Please try again later."
            } else if (error.code === "auth/requires-recent-login") {
              errorMessage = "Session expired. Please log in again to perform this action."
            } else if (error.code === "auth/user-not-found") {
              errorMessage = "User not found. Please log in again."
            } else if (error.code === "permission-denied") {
              errorMessage = "Permission denied. You don't have access to this data."
            } else {
              errorMessage = "Failed to log out. Please try again later."
            }

            setAuthError(errorMessage)
        } finally {
            setAuthLoading(false)
        }
    }
    
    return (
        <AuthContext.Provider value={{user, logOut, setUser, authLoading, authError}}>
            {children}
        </AuthContext.Provider>
    )
}

