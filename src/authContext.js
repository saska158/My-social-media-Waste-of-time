/*
Primeni na kontekst znanje iz knjige, sredi performans, 
pogledaj koja su sva rerenderovanja zbog promene state-a
ostavi neke komentare mozda u zavrsnoj verziji kako bi videli kko si razmisljala
*/

import { 
    auth, 
    database, 
    ref, 
    update, 
    onAuthStateChanged, 
    signOut,
    //requestNotificationPermission,
    //listenForMessages,
    //saveUserToken
} from "./firebase"
import { useState, useEffect, createContext, useContext } from "react"


const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)

    //console.log("user iz konteksta", user)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)

            if(user) {
                // Request notification permission and save the FCM token
                const token =  await requestNotificationPermission(user.uid)  
                if(token) {
                    await saveUserToken(user.uid, token) // Save token to the Realtime DB
                }
                // Listen for incoming messages or notifications
                listenForMessages() 
            }
        })

        return () => unsubscribe()
    }, [])

    const logOut = async () => {
        try {
            const user = auth.currentUser
            if(user) {
                const uid = user.uid
                const userRef = ref(database, `users/${uid}`)
                await update(userRef, { isActive: false })
                await signOut(auth)
                setUser(null)
                console.log("Korisnik odjavljen.")
            }
        } catch(error) {
            console.error("Greška prilikom odjavljivanja:", error.message)
        }
    }

    //console.log('nas user:', user)

    return (
        <AuthContext.Provider value={{user, logOut, setUser}}>{children}</AuthContext.Provider>
    )
}

