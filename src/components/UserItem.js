import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/authContext"
import { firestore, doc, getDoc, updateDoc, arrayUnion } from "../api/firebase"

const UserItem = ({userItem, users}) => {
    // State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Context
    const {user} = useAuth()

    // Functions

    const handleFollowToggle = async (userUid, e) => {
        e.stopPropagation()
        setLoading(true)
    
        try {
          const myProfileRef = doc(firestore, "profiles", user.uid)
          const myProfileSnap = await getDoc(myProfileRef)
          const otherUserProfileRef = doc(firestore, "profiles", userUid)
          const otherUserProfileSnap = await getDoc(otherUserProfileRef)
    
          const followedByMe = users.some(usr => usr.uid === userUid && usr.followedByMe)
            if(followedByMe) {
              // Unfollow: remove user from followers/following
              await updateDoc(myProfileRef, {following: myProfileSnap.data().following?.filter(profile => profile.uid !== userUid)})
              await updateDoc(otherUserProfileRef, {followers: otherUserProfileSnap.data().followers?.filter(follower => follower.uid !== user.uid)})
          } else {
              // Follow: add user to followers/following
              await updateDoc(otherUserProfileRef, {followers: arrayUnion(myProfileSnap.data())})
              await updateDoc(myProfileRef, {following: arrayUnion(otherUserProfileSnap.data())})
          }
        } catch(error) {
          setError(error)
        } finally {
          setLoading(false)
        }
    }
    
    return (
        <div 
            key={userItem.uid}
            style={{
                padding: '2em',
                borderBottom: '.5px solid salmon',
                display: 'flex',
                alignItems: 'center',
                gap: '.5em',
            }}
        >
            <Link to={`user/${userItem.uid}`}>
                <div style={{display: 'flex', alignItems: 'start', gap: '.3em'}}>
                    <img
                      src={userItem.photoURL}
                      alt="profile"
                      style={{
                        width: '30px', 
                        height: '30px',
                        objectFit: 'cover',
                        objectPosition: 'top',
                        display: 'inline',
                        borderRadius: '50%'
                      }}
                    />
                    <span>{userItem.displayName}</span>
                </div>
            </Link>
            <button 
                onClick={(e) => handleFollowToggle(userItem.uid, e)}
                disabled={loading}
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
                {
                    loading ? "loading..." :
                    userItem.followedByMe ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                        </svg>
                    )
                }
            </button>
        </div>
    )
}

export default UserItem