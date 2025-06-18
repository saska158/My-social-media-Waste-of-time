import { useState, useEffect } from "react"
import { useParams, useOutletContext } from "react-router-dom"
import { firestore, doc, onSnapshot } from '../api/firebase'
import { useAuth } from "../contexts/authContext"
import ChatBox from '../components/one_on_one_chat/ChatBox'
import PopUp from "../components/PopUp"
import ProfileEditor from "../components/user_profile/ProfileEditor"
import UserProfileHeader from "../components/user_profile/UserProfileHeader"
import UserProfileNavigation from "../components/user_profile/UserProfileNavigation"
import UserProfileContent from "../components/user_profile/UserProfileContent"
import ErrorMessage from "../components/errors/ErrorMessage"
import UserProfileSkeleton from "../components/skeletons/UserProfileSkeleton"
import { useMediaQuery } from "react-responsive"

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
  const [activeSection, setActiveSection] = useState("currently")
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
  const [isFollowPopupShown, setIsFollowPopupShown] = useState(false)
  const [isEditPopupShown, setIsEditPopupShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryFlag, setRetryFlag] = useState(0)

  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset)
  const [isVisible, setIsVisible] = useState(true)

  const { toggleNav } = useOutletContext()

  // Hooks that don't trigger re-renders 
  const { profileUid } = useParams()

  const isMobile = useMediaQuery({ maxWidth: 767 })

  // Effects
  useEffect(() => {
    const profileRef = doc(firestore, "profiles", profileUid)

    setLoading(true)
    setError(null)

    const unsubscribe = onSnapshot(
      profileRef, 
      (snapshot) => {
        if(snapshot.exists()) {
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

  }, [profileUid, retryFlag])

  useEffect(() => {
    setIsChatBoxVisible(false)
  }, [profileUid])

  useEffect(() => {
    setActiveSection('currently')
  }, [profileUid])

  //handling header visibility based on scrolling:
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset
      setIsVisible(prevScrollPos > currentScrollPos)
      setPrevScrollPos(currentScrollPos)
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [prevScrollPos])

  //Functions

  const handleRetry = () => {
    setLoading(true)
    setRetryFlag(prev => prev + 1)
  }

  return (
    <div className="user-profile-container">
      {
        isMobile && (
          <div
            style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '.5em',
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              transition: 'transform 500ms',
            }}
            className={isVisible ? '' : 'disappear'}
          >
            <img
              src={`${process.env.PUBLIC_URL}/images/icon-green.png`}
              className="user-img user-img-medium"
              alt="logo"
            />

            <button onClick={toggleNav} className="no-padding-btn">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '25px', color: '#4b896f'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </button>
          </div>
        )
      }
      {loading ? <UserProfileSkeleton /> : (
        <div>
          {
            !isChatBoxVisible ? (
              <div 
                style={{display: 'flex', flexDirection: 'column'}}
                className={isVisible ? '' : 'disappear'}
              >
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
            <p style={{ margin: '2em'}}>You need to follow each other to send a message.</p>
          </PopUp>
        )
      }
      </div>
      )}
      { error && <ErrorMessage message={error} isFatal={true} onRetry={handleRetry} /> }
    </div>
  )
}

export default UserProfile





