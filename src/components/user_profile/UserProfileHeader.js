import { useState } from "react"
import { useAuth } from "../../contexts/authContext"
import { useLoading } from "../../contexts/loadingContext"
import { firestore, doc, getDoc, updateDoc, arrayUnion } from "../../api/firebase"
import { PulseLoader } from "react-spinners"

const UserProfileHeader = ({profile, profileUid, isFollowing, setIsEditPopupShown}) => {
    // Context
    const { user } = useAuth()
    const { loadingState, setLoadingState } = useLoading()

    // State
    const [error, setError] = useState(null)

    // Functions
    const handleFollowToggle = async (otherUserUid) => {
      setLoadingState(prev => ({...prev, upload: true}))
        
      try {
        const myProfileRef = doc(firestore, "profiles", user.uid)
        const myProfileSnap = await getDoc(myProfileRef)
        const otherUserProfileRef = doc(firestore, "profiles", otherUserUid)
        const otherUserProfileSnap = await getDoc(otherUserProfileRef)
    
        if(isFollowing) {
          await updateDoc(myProfileRef, {following: myProfileSnap.data().following.filter(profile => profile.uid !== profileUid)})
          await updateDoc(otherUserProfileRef, {followers: profile.followers.filter(follower => follower.uid !== user.uid)})
        } else {
            await updateDoc(myProfileRef, {following: arrayUnion(otherUserProfileSnap.data())})
            await updateDoc(otherUserProfileRef, {followers: arrayUnion(myProfileSnap.data())})
        } 
      } catch(error) {
          setError(error)
      } finally {
        setLoadingState(prev => ({...prev, upload: false}))
      }
    }

    const handleEditButton = (e) => {
      e.stopPropagation()
      setIsEditPopupShown(true)
    }

    const isMyProfile = profileUid === user?.uid

    return (
        <>
          <div className="user-profile-content">        
              <div>
                <img 
                  src={profile.photoURL || "/images/no-profile-picture.png"} 
                  alt="profile-picture" 
                  className="user-profile-profile-picture"
                />
                <p className="user-profile-displayName">
                  {profile.displayName}
                </p>
              </div>
              {
                user && !isMyProfile ? (
                  loadingState.upload ? <PulseLoader color="white" /> :
                    <button
                      className="follow-toggle-button"
                      onClick={() => handleFollowToggle(profileUid)}
                      disabled={loadingState.upload}
                    >
                      {
                        isFollowing ? (
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
                ) : null
             }
             {
               isMyProfile && <button className="edit-profile-button" onClick={handleEditButton}> Edit Profile</button>
             }
            </div>
            <div>
              <span>
                <strong>{profile.followers?.length || 0}</strong>
                {profile.followers?.length === 1 ? 'follower' : 'followers'}
              </span>
              <span>
                <strong>{profile.following?.length || 0}</strong>
                following
              </span>
            </div>
        </>
    )
}

export default UserProfileHeader