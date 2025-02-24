import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "./authContext"
import { 
    collection,
    firestore,
    onSnapshot,
    doc, 
    getDoc,
    updateDoc,
    arrayUnion
} from "./firebase"
import PopUp from "./PopUp"

const UsersQuery = ({setIsUsersQueryShown}) => {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)
    const location = useLocation()
    const prevLocation = useRef(location.pathname)


    useEffect(() => {
            const usersRef = collection(firestore, 'profiles')
            const unsubscribe = onSnapshot(usersRef, (snapshot) => {
                if(!snapshot.empty) {
                    const usersArray = snapshot.docs.map((doc) => ({
                        ...doc.data(),
                        followedByMe: doc.data()?.followers?.some(follower => follower.uid === user.uid)
                    }))
                    setUsers(usersArray)    
                } else {
                 setUsers([])
                }
            })
    
            return () => unsubscribe()
    }, [])

    console.log("korisnici", users)
    

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }  
    
    const filteredUsers = users.filter((user) =>
      user.displayName.toLowerCase().startsWith(searchQuery.toLowerCase())
    )

    useEffect(() => {
        if(prevLocation.current !== location.pathname) {
            setIsUsersQueryShown(false)
        } 
        prevLocation.current = location.pathname
    }, [location.pathname])

  

    const handleFollowToggle = async (userUid, e) => {
        e.stopPropagation()
        if(!user) {
            setIsJoinPopupShown(true)
            return
        } 

        const myProfileRef = doc(firestore, "profiles", user.uid)
        const myProfileSnap = await getDoc(myProfileRef)
        const otherUserProfileRef = doc(firestore, "profiles", userUid)
        const otherUserProfileSnap = await getDoc(otherUserProfileRef)
        const myFollowing = myProfileSnap.data().followers || []
        const otherUserFollowers = otherUserProfileSnap.data().followers || []

        //const isFollowing = users.length > 0 && users.some(user => user. === userUid)
        const followedByMe = users.some(usr => usr.uid === userUid && usr.followedByMe)

        console.log("snap",followedByMe)

        if(followedByMe) {
            // Unfollow: remove user from followers/following
            await updateDoc(myProfileRef, {following: myProfileSnap.data().following?.filter(profile => profile.uid !== userUid)})
            await updateDoc(otherUserProfileRef, {followers: otherUserProfileSnap.data().followers?.filter(follower => follower.uid !== user.uid)})

            //Update state instantly
            //setUsers(prevUsers => prevUsers.map(user => user.uid === userUid ?
                //{...user, followers: user.followers.filter(follower => follower.uid !== user.uid)} :
                //user
            //))
        } else {
            // Follow: add user to followers/following
            await updateDoc(otherUserProfileRef, {followers: arrayUnion(myProfileSnap.data())})
            await updateDoc(myProfileRef, {following: arrayUnion(otherUserProfileSnap.data())})

            // Update state instantly
            //setUsers(prevUsers => prevUsers.map(user => user.uid === userUid ?
                //{...user, followers: [...user.followers, {uid: user.uid, displayName: user.displayName}]} :
               // user
            //))
        }
        
    }

    return (
        <>
        <PopUp setIsPopUpShown={setIsUsersQueryShown}>
            <input
              type="text"
              placeholder="search users"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{margin: '1em', alignSelf: 'flex-start'}}
            />
            {
                user ? (
                    filteredUsers.filter(usr => usr.uid !== user.uid).map(usr => {
                        return (
                            <div 
                              key={usr.uid}
                              style={{
                                padding: '2em',
                                borderBottom: '.5px solid salmon',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '.5em'
                              }}
                        >
                            <Link to={`user/${usr.uid}`}>{usr.displayName}</Link>
                            <button 
                              /*style={{
                                background: 'blue',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                color: 'white',
                                border: '0'
                              }}*/
                              onClick={(e) => handleFollowToggle(usr.uid, e)}
                            >
                                {
                                    usr.followedByMe ? (
                                        <div
                                          style={{
                                            border: '.5px solid salmon',
                                            color: 'salmon',
                                            padding: '.5em .8em',
                                            borderRadius: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1em'
                                          }}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                          </svg>
                                          {/*<span>unfollow</span>*/}
                                        </div>
                                    ) : (
                                        <div
                                          style={{
                                            border: '.5px solid salmon',
                                            color: 'salmon',
                                            padding: '.5em .8em',
                                            borderRadius: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1em'
                                          }}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                          </svg>
                                          {/*<span>follow</span>*/}
                                        </div>
                                    )
                                }
                            </button>
                        </div>
                        )
                    })
                ) : (
                        filteredUsers.map(usr => (
                            <div 
                              key={usr.uid}
                              style={{
                                padding: '2em',
                                borderBottom: '.5px solid white'
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
                                  onClick={(e) => handleFollowToggle(usr.uid, e)}
                                >
                                    +
                                </button>
                            </div>
                        ))
                )
            }
        </PopUp>
        {
            isJoinPopupShown && (
                <PopUp setIsPopUpShown={setIsJoinPopupShown}>
                  <h1>Razgovori</h1>
                  <p>Sign in or create your account to join the conversation!</p>
                  <Link to="/sign-up">
                    <button 
                      style={{
                        fontSize: '1rem', 
                        background: 'salmon', 
                        padding: '.7em 1.2em', 
                        borderRadius: '10px',
                        color: 'white'
                      }}
                    >
                      Create an account
                    </button>
                  </Link>
                  <Link to="/sign-in">
                    <button 
                      style={{
                        fontSize: '1rem',
                        padding: '.7em 1.2em', 
                        borderRadius: '10px',
                        background: 'rgba(238, 171, 163, .5)'
                      }}
                    >
                      Sign in
                    </button>
                  </Link>
                </PopUp>
              )
        }
        </>
    )
}

export default UsersQuery



