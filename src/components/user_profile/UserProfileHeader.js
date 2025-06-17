import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import fetchProfile from "../../api/fetchProfile"
import FollowButton from "../FollowButton"
import ErrorMessage from "../errors/ErrorMessage"


const UserProfileHeader = ({
  profile, 
  profileUid, 
  setIsEditPopupShown, 
  isChatBoxVisible, 
  setIsChatBoxVisible, 
  setIsFollowPopupShown
}) => {
    // Context
    const { user } = useAuth()

    // State
    const [currentUser, setCurrentUser] = useState(null)
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
      <div className="user-profile-header-container">  
        <img 
          src={profile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
          alt="profile-picture" 
          className="user-img user-img-big"
        />
        <div>
          <div style={{fontSize: '.9rem', marginBottom: '1em'}}>
            <p className="user-profile-displayName">{profile.displayName}</p>
            <span>{profile.followers?.length || 0}</span>
            <span>{profile.followers?.length === 1 ? 'follower' : 'followers'}</span>
            <span>{profile.following?.length || 0}</span>
            <span>following</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
            {
              user && !isMyProfile ? (
                <FollowButton
                  currentUser={currentUser}
                  targetUser={profile}
                  type="text"
                  style={{background: '#4b896f', color: '#fff'}}
                />
              ) : null
            }
            {
              user && !isMyProfile ? (
                <button 
                  style={{
                    background: "#eaf4f0", 
                    color: '#4b896f',
                  }} 
                  onClick={handleMessageButton}
                >
                  message
                </button>
              ) : null
            }
            {
              isMyProfile && (
                <button 
                  style={{
                    background: "#eaf4f0", 
                    color: '#4b896f',
                    fontWeight: '700'
                  }} 
                  onClick={handleEditButton}
                >
                  Edit Profile
                </button>
              )
            }
            {error && <ErrorMessage message={error} />}      
          </div>
        </div>
      </div>
    )
}

export default UserProfileHeader