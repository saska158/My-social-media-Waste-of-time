import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { useAuth } from "../../contexts/authContext"
import fetchProfile from "../../api/fetchProfile"
import FollowButton from "../FollowButton"
import ErrorMessage from "../errors/ErrorMessage"
import { useMediaQuery } from "react-responsive"

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

    const { toggleNav } = useOutletContext()

    const isMyProfile = profileUid === user?.uid

    const isMobile = useMediaQuery({ maxWidth: 767 })

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
          { 
              isMobile && (
                <button onClick={toggleNav}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '25px', color: '#4b896f'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                  </svg>
                </button>
              )
            }
          <div className="user-profile-header-container">  
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
              isMyProfile && (
                <button 
                  style={{
                    background: "#eaf4f0", 
                    color: '#4b896f'
                  }} 
                  onClick={handleEditButton}
                >
                  Edit Profile
                </button>
              )
            }
            {
              user && !isMyProfile ? (
                <button 
                  style={{
                    background: "#eaf4f0", 
                    color: '#4b896f'
                  }} 
                  onClick={handleMessageButton}
                  >
                    message
                  </button>
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