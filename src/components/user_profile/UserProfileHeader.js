import { useAuth } from "../../contexts/authContext"
import FollowButton from "../FollowButton"

const UserProfileHeader = ({profile, profileUid, setIsEditPopupShown, isChatBoxVisible, setIsChatBoxVisible, setIsFollowPopupShown}) => {
    // Context
    const { user } = useAuth()

    const isMyProfile = profileUid === user?.uid

    // Functions
    const handleEditButton = (e) => {
      e.stopPropagation()
      setIsEditPopupShown(true)
    }

    const handleMessageButton = (e) => {
      e.stopPropagation()
      const amIFollowingThisUser = profile.followers.some(follower => follower === user.uid)
      const isThisUserFollowingMe = profile.following ? profile.following.some(follower => follower === user.uid) : false
  
      if(amIFollowingThisUser && isThisUserFollowingMe) {
        setIsChatBoxVisible(!isChatBoxVisible)
      } else {
        setIsFollowPopupShown(true)
      }
    }

    return (
        <>
          <div className="user-profile-content">        
            <div>
              <img 
                src={profile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
                alt="profile-picture" 
                className="user-profile-profile-picture"
              />
              <p className="user-profile-displayName">{profile.displayName}</p>
            </div>
            {
              user && !isMyProfile ? (
                <FollowButton
                  currentUserUid={user.uid}
                  targetUserUid={profileUid}
                />
              ) : null
            }
            {
              isMyProfile && <button className="edit-profile-button" onClick={handleEditButton}>Edit Profile</button>
            }
            {
              user && !isMyProfile ? (
                <button className="message-button" onClick={handleMessageButton}>message</button>
              ) : null
            }
          </div>
          <div 
            style={{
              padding: '.5em', 
              paddingTop: '0', 
              display: 'flex', 
              gap: '.5em', 
              fontSize: '.9rem',
              background: '#f7a1a1'
            }}
          >
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