import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import fetchProfile from "../../api/fetchProfile"
import FollowButton from "../FollowButton"
import ErrorMessage from "../errors/ErrorMessage"

const UserProfileHeader = ({profile, profileUid, setIsEditPopupShown, isChatBoxVisible, setIsChatBoxVisible, setIsFollowPopupShown}) => {
    // Context
    const { user } = useAuth()

    // State
    const [currentUser, setCurrentUser] = useState(null)
    const [showFollowers, setShowFollowers] = useState(false)
    const [showFollowing, setShowFollowing] = useState(false)
    const [error, setError] = useState(null)

    const isMyProfile = profileUid === user?.uid

    // Effects
    useEffect(() => {
      if(!user) return

      const getCurrentUserProfile = async () => {
        setError(null)
        try {
          await fetchProfile(user.uid, setCurrentUser)
        } catch(error) {
          console.error("Error fetching profile:", error)
          setError("Oops! Can’t follow the user. Please try again later.")
        } 
      }
    
      getCurrentUserProfile()
    }, [user?.uid])


    // Functions
    const handleEditButton = (e) => {
      e.stopPropagation()
      setIsEditPopupShown(true)
    }

    const handleMessageButton = (e) => {
      e.stopPropagation()
      const amIFollowingThisUser = profile.followers.includes(user.uid)
      const isThisUserFollowingMe = profile.following ? profile.following.includes(user.uid) : false
  
      if(amIFollowingThisUser && isThisUserFollowingMe) {
        setIsChatBoxVisible(!isChatBoxVisible)
      } else {
        setIsFollowPopupShown(true)
      }
    }

    return (
        <div>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center', 
              gap: '3em' 
            }}
          >  
            <div>
              <img 
                src={profile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
                alt="profile-picture" 
                className="user-img user-img-big"
              />
              <p className="user-profile-displayName">{profile.displayName}</p>
            </div>
            {
              user && !isMyProfile ? (
                <FollowButton
                  currentUser={currentUser}
                  targetUser={profile}
                />
              ) : null
            }
            {error && <ErrorMessage message={error} />}      
            {
              isMyProfile && <button className="dark-border" onClick={handleEditButton}>Edit Profile</button>
            }
            {
              user && !isMyProfile ? (
                <button className="dark-border" onClick={handleMessageButton}>message</button>
              ) : null
            }
          </div>
          <div 
            style={{
              display: 'flex', 
              gap: '.5em', 
              fontSize: '.9rem',
            }}
          >
            <p style={{display: 'flex', gap: '2px'}}>
              <span>{profile.followers?.length || 0}</span>
              <span>{profile.followers?.length === 1 ? 'follower' : 'followers'}</span>
            </p>
            <p style={{display: 'flex', gap: '2px'}}>
              <span>{profile.following?.length || 0}</span>
              <span>following</span>
            </p>
          </div>
        </div>
    )
}

export default UserProfileHeader