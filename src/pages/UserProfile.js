import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { firestore, doc, onSnapshot } from '../api/firebase'
import { useAuth } from "../contexts/authContext"
import ChatBox from '../components/one_on_one_chat/ChatBox'
import PopUp from "../components/PopUp"
import ProfileEditor from "../components/user_profile/ProfileEditor"
import UserProfileHeader from "../components/user_profile/UserProfileHeader"
import UserProfileNavigation from "../components/user_profile/UserProfileNavigation"
import UserProfileContent from "../components/user_profile/UserProfileContent"

const UserProfile = () => {
  // Context
  const { user } = useAuth()
 
  // State
  const [profile, setProfile] = useState({
    uid: "",
    displayName: "",
    bio: "", 
    currently: {
      watching: '',
      reading: '',
      listening: ''
    },
    favorites: {
      watching: '',
      reading: '',
      listening: ''
    },
    photoURL: "",
    followers: [],
    following: []
  })  
  const [activeSection, setActiveSection] = useState("bio")
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
  const [isFollowPopupShown, setIsFollowPopupShown] = useState(false)
  const [isEditPopupShown, setIsEditPopupShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders 
  const { profileUid } = useParams()

  const isMyProfile = profileUid === user?.uid

  // Functions
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
  
  // Effects
  useEffect(() => {
    const profileRef = doc(firestore, "profiles", profileUid)
    setLoading(true)

    const unsubscribe = onSnapshot(
      profileRef, 
      (snapshot) => {
        if(!snapshot.empty) {
          setProfile(snapshot.data())
          setError(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error(error)
        setError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()

  }, [profileUid])

  useEffect(() => {
    setIsChatBoxVisible(false)
  }, [profileUid])

  return (
    <div className="user-profile-container">
      {
        !isChatBoxVisible ? (
          <>
            <UserProfileHeader {...{profile, profileUid, setIsEditPopupShown}} />
            <UserProfileNavigation {...{activeSection, setActiveSection}}/>  
            <UserProfileContent {...{activeSection, profile, profileUid}}/>
            {
              user && !isMyProfile ? (
                <button className="message-button" onClick={handleMessageButton}>message</button>
              ) : null
            }
          </>
        ) : <ChatBox 
              chatPartnerProfile={profile} 
              setIsChatBoxVisible={setIsChatBoxVisible} 
            />
      }
    
      {
        isEditPopupShown && (
          <PopUp setIsPopUpShown={setIsEditPopupShown} style={{overflowY: 'auto'}}>
            <ProfileEditor {...{profile, setProfile, profileUid}} />
          </PopUp>
        )
      }
      {
        isFollowPopupShown && (
          <PopUp setIsPopUpShown={setIsFollowPopupShown}>
            <p>You need to follow each other to send a message.</p>
          </PopUp>
        )
      }
    </div>
  )
}

export default UserProfile





