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
            setAuthError(error.message)
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
            console.error("Greška prilikom odjavljivanja:", error.message)
            setAuthError(error.message)
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

