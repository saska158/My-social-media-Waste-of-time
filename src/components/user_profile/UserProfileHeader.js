import { useAuth } from "../../contexts/authContext"
import FollowButton from "../FollowButton"

const UserProfileHeader = ({profile, profileUid, setIsEditPopupShown}) => {
    // Context
    const { user } = useAuth()

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