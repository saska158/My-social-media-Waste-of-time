import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "./authContext"
import { 
    database, 
    ref, 
    onValue, 
    firestore,
    doc, 
    getDoc,
    updateDoc,
    arrayUnion
} from "./firebase"

const UsersQuery = ({listOfUsers, setListOfUsers, setIsUsersQueryShown}) => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const searchRef = useRef(null)
    const location = useLocation()
    const prevLocation = useRef(location.pathname)

    useEffect(() => {
            const usersRef = ref(database, 'users')
            const unsubscribe = onValue(usersRef, (snapshot) => {
                const usersData = snapshot.val()
               // console.log('Users Data:', Object.values(usersData))
                if(usersData) {
                    const usersArray = Object.values(usersData)
                    setListOfUsers(usersArray)
                }
            })
    
            return () => unsubscribe()
    }, [])

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }  
    
    // Filter users based on search input
    const filteredUsers = listOfUsers.filter((user) =>
      user.displayName.toLowerCase().startsWith(searchQuery.toLowerCase())
    )

    useEffect(() => {
        const handleClickOutside = (e) => {
            if(searchRef.current && !searchRef.current.contains(e.target)) {
                setIsUsersQueryShown(false)
            }
        }
        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
        //document.addEventListener("click", (e) => console.log(searchRef.current.contains(e.target)))
    }, [])

    useEffect(() => {
        if(prevLocation.current !== location.pathname) {
            setIsUsersQueryShown(false)
        } 
        prevLocation.current = location.pathname
    }, [location.pathname])

    //follow user

    //NAPRAVITI DA NE MOZE DA SE FOLLOWUJE AKO NISI ULOGOVAN
    //KAD SE ZAPRATI NEKAKO PRILAGODITI UI DA VISE NEMA OPCIJE ZAPRATI NEGO OTPRATI
    //OVO SE PONAVLJA U USERPROFIL
    //MOGU LI FUNKCIJE SA FIREBASE DA BUDU REUSABILNE I U NEKOM ZASEBNOM FAJLU?
    const followUser = async (otherUserUid) => {
        //slanje u firestore/profiles/following
        if(user) {
            const myProfileRef = doc(firestore, "profiles", user.uid)
            const myProfileSnap = await getDoc(myProfileRef)
            const otherUserProfileRef = doc(firestore, "profiles", otherUserUid)
            const otherUserProfileSnap = await getDoc(otherUserProfileRef)
             
            if(otherUserProfileSnap.exists()) {
                await updateDoc(myProfileRef, {following: arrayUnion(otherUserProfileSnap.data())})
            }
            
            if(myProfileSnap.exists()) {
                await updateDoc(otherUserProfileRef, {followers: arrayUnion(myProfileSnap.data())})//ovo je profil
            }
        }
        console.log('followed')
    }

    return (
        <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(238, 171, 163, .5)'
        }}>
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: '50%',
            height: '50%',
            background: 'salmon',
            transform: 'translate(-50%, -50%)'
          }}
          ref={searchRef}
          >
          <input
              type="text"
              placeholder="search users"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {
                //searchQuery && (
                    user ? (
                        filteredUsers.filter(usr => usr.uid !== user.uid && !usr.isActive).map(usr => (
                            <div 
                              key={usr.uid}
                              style={{
                                padding: '2em',
                                borderBottom: '.5px solid grey'
                              }}
                            >
                                <Link to={`user/${usr.uid}`}>{usr.displayName}</Link>
                                <button 
                                  style={{
                                    background: 'blue',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    color: 'white',
                                    border: '0'
                                  }}
                                  onClick={() => followUser(usr.uid)}
                                >
                                    +
                                </button>
                            </div>
                        ))
                    ) : (
                        filteredUsers.filter(usr => !usr.isActive).map(usr => (
                            <div 
                              key={usr.uid}
                              style={{
                                padding: '2em',
                                borderBottom: '.5px solid grey'
                              }}
                            >
                                <Link to={`user/${usr.uid}`}>{usr.displayName}</Link>
                                <button 
                                  style={{
                                    background: 'blue',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    color: 'white',
                                    border: '0'
                                  }}
                                >
                                    +
                                </button>
                            </div>
                        ))
                    )
                //)
            }
          </div>
        </div>
    )
}

export default UsersQuery