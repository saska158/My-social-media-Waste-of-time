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
import ErrorMessage from "../components/ErrorMessage"

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

  // Effects
  useEffect(() => {
    const profileRef = doc(firestore, "profiles", profileUid)

    setLoading(true)
    setError(null)

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

        let errorMessage
        if (error.code === "unavailable" || error.code === "network-request-failed") {
          errorMessage = "Network error. Please check your connection."
        } else if (error.code === "permission-denied") {
          errorMessage = "You don't have permission to access this profile."
        } else {
          errorMessage = "Failed to load profile. Please try again later."
        }

        setError(errorMessage) 
        setLoading(false)
      }
    )

    return () => unsubscribe()

  }, [profileUid])

  useEffect(() => {
    setIsChatBoxVisible(false)
  }, [profileUid])

  if(error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="user-profile-container">
      {
        !isChatBoxVisible ? (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <UserProfileHeader {...{profile, profileUid, setIsEditPopupShown, isChatBoxVisible, setIsChatBoxVisible, setIsFollowPopupShown}} />
            <UserProfileNavigation {...{activeSection, setActiveSection}}/>  
            {
              profileUid && <UserProfileContent {...{activeSection, profile, profileUid}}/>
            }
          </div>
        ) : <ChatBox 
              chatPartnerProfile={profile} 
              setIsChatBoxVisible={setIsChatBoxVisible} 
            />
      }
    
      {
        isEditPopupShown && (
          <PopUp setIsPopUpShown={setIsEditPopupShown}>
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





