import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import fetchProfile from "../../api/fetchProfile"
import FollowButton from "../FollowButton"
import UserItem from "../users_list/UserItem"
import PopUp from "../PopUp"

const UserProfileHeader = ({profile, profileUid, setIsEditPopupShown, isChatBoxVisible, setIsChatBoxVisible, setIsFollowPopupShown}) => {
    // Context
    const { user } = useAuth()

    // State
    const [currentUser, setCurrentUser] = useState(null)
    const [showFollowers, setShowFollowers] = useState(false)
    const [showFollowing, setShowFollowing] = useState(false)
    const [error, setError] = useState(null)

    const isMyProfile = profileUid === user?.uid

    useEffect(() => {
      if(!user) return
      const getProfile = async () => {
        try {
          await fetchProfile(user.uid, setCurrentUser)
        } catch(error) {
          console.error("Error fetching profile:", error)
          setError(error)
        }
      }
    
      getProfile()
    }, [user?.uid])

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

    const handleShowFollowers = (e) => {
      e.stopPropagation()
      //if(!user) {
        //setIsJoinPopupShown(true)
      //} else {
        setShowFollowers(!showFollowers)
      //}
    }


    const handleShowFollowing = (e) => {
      e.stopPropagation()
      //if(!user) {
        //setIsJoinPopupShown(true)
      //} else {
        setShowFollowing(!showFollowing)
      //}
    }

    console.log("show", showFollowing)

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
                  currentUser={currentUser}
                  targetUser={profile}
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
            <button
             onClick={handleShowFollowers}
            >
              {profile.followers?.length || 0}
              {profile.followers?.length === 1 ? 'follower' : 'followers'}
            </button>
            <button
              onClick={handleShowFollowing}
            >
              {profile.following?.length || 0}
              following
            </button>

            {
            showFollowers && (
              <PopUp setIsPopUpShown={setShowFollowers}>
                {
                  profile?.followers?.length > 0 ? (
                    profile.followers.map(follower => <UserItem key={follower.uid} user={follower} />)
                  ) : 'No followers'
                }
              </PopUp>
            )
          }
          {
            showFollowing && (
              <PopUp setIsPopUpShown={setShowFollowing}>
                {
                  profile?.following?.length > 0 ? (
                    profile.following.map(person => <UserItem key={person.uid} user={person} />)
                  ) : 'No following'
                }
              </PopUp>
            )
          }
          </div>
        </>
    )
}

export default UserProfileHeader