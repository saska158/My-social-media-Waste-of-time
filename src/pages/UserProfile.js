import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { 
  firestore, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  onSnapshot,
} from '../api/firebase'
import { useAuth } from "../contexts/authContext"
import { useLoading } from "../contexts/loadingContext"
import ChatBox from '../components/one_on_one_chat/ChatBox'
import PopUp from "../components/PopUp"
import ProfileEditor from "../components/user_profile/ProfileEditor"
import UserProfileNavigation from "../components/user_profile/UserProfileNavigation"
import UserProfileTags from "../components/user_profile/UserProfileTags"
import UserPosts from "../components/user_profile/UserPosts"
import { PulseLoader } from "react-spinners"

const UserProfile = () => {
  // Context
  const { user } = useAuth()
  const { loadingState, setLoadingState } = useLoading()
  
  // State
  const [profile, setProfile] = useState({
    displayName: "",
    description: "",
    musicTaste: "",
    politicalViews: "",
    photoURL: "",
    followers: [],
    following: []
  }) //treba li i uid?
  
  const [isFollowing, setIsFollowing] = useState(false)
  
  const [room, setRoom] = useState('main') 
  const [activeSection, setActiveSection] = useState("description")
  const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
  const [isFollowPopupShown, setIsFollowPopupShown] = useState(false)
  const [isEditPopupShown, setIsEditPopupShown] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders 
  const { profileUid } = useParams()

  const isMyProfile = profileUid === user?.uid

  // Functions
  const handleMessageButton = (e) => {
    e.stopPropagation()
    const amIFollowingThisUser = profile.followers.some(follower => follower.uid === user.uid)
    const isThisUserFollowingMe = profile.following ? profile.following.some(follower => follower.uid === user.uid) : false

    if(amIFollowingThisUser && isThisUserFollowingMe) {
      setIsChatBoxVisible(!isChatBoxVisible)
    } else {
      setIsFollowPopupShown(true)
    }
  }

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
  

  // Effects
  useEffect(() => {
    const profileRef = doc(firestore, "profiles", profileUid)
    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if(snapshot.exists()) {
        const profileData = snapshot.data()
        setProfile(profileData)
        if(user) {
          setIsFollowing(profileData.followers?.some(follower => follower.uid === user?.uid))
        }
      }
    })

    return () => unsubscribe()

  }, [profileUid, user?.uid])

  useEffect(() => {
    setIsChatBoxVisible(false)
  }, [profileUid])

  return (
    <div className="user-profile-container">
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
                    <div style={{display: 'flex', alignItems: 'center', gap: '.5em'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                      <span>unfollow</span>
                    </div>
                  ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '.5em'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                      <span>follow</span>
                    </div>
                  )
                }
              </button>
          ) : null
        }
        {
          isMyProfile && (
            <button
              className="edit-profile-button"
              onClick={(e) => {
                e.stopPropagation()
                setIsEditPopupShown(true)
              }}
            >
              Edit Profile
            </button>
          )
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
            
      <UserProfileNavigation activeSection={activeSection} setActiveSection={setActiveSection} />
            
      <div className="user-profile-description">
        <UserProfileTags activeSection={activeSection} profile={profile}/>
        {
          activeSection === "posts" && <UserPosts {...{room, setRoom, profileUid}} />
        }
      </div>

      {
        user && !isMyProfile ? (
          <button className="message-button" onClick={handleMessageButton}>
            message
          </button>
        ) : null
      }
    
      {
        isChatBoxVisible && (
          <ChatBox chatPartnerUid={profileUid} chatPartnerProfile={profile} setIsChatBoxVisible={setIsChatBoxVisible} />
        )
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





