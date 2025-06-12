import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import fetchProfile from "../../api/fetchProfile"
import { getDoc, updateDoc, onSnapshot, deleteField } from "../../api/firebase"
import PopUp from "../PopUp"
import JoinPopUp from "../JoinPopUp"
import UserItem from "../users_list/UserItem"
import UserCard from "../users_list/UserCard"
import ErrorMessage from "../errors/ErrorMessage"

const FirestoreItemActions = ({
  firestoreDoc, 
  firestoreCollection, 
  showComments,
  setShowComments
}) => {

  // Context
  const { user } = useAuth()
  
  // State
  const [likes, setLikes] = useState(null)  
  const [showLikes, setShowLikes] = useState(false)
  const [numberOfComments, setNumberOfComments] = useState(0)  
  const [profile, setProfile] = useState(null)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false) 
  const [error, setError] = useState(null)

  // Functions
  const handleLike = async (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      try {
        const snapshot = await getDoc(firestoreDoc)
        const likes = snapshot.data().likes || {}
  
        if (likes[user?.uid]) {
          await updateDoc(firestoreDoc, {[`likes.${user.uid}`]: deleteField()})
          console.log("Unliked")
        } else {
          await updateDoc(firestoreDoc, {[`likes.${user.uid}`]: {
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid
          }})
          console.log("Liked")
        }
      } catch (error) {
        console.error("Error updating like:", error)
        setError("There was an issue saving your like. Please try again.")
      }
    } 
  }
  
  const handleShowComments = (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      setShowComments(!showComments)
    }
  }

  const handleShowLikes = (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      setShowLikes(!showLikes)
    }
  }

  // Effects
  useEffect(() => {
    const unsubscribe = onSnapshot(firestoreDoc, (snapshot) => {
      if(snapshot.exists()) {
        const likes = snapshot.data()?.likes || {}
        setLikes(likes)
      }
    }, (error) => {
    console.error(error)
    })

    return () => unsubscribe()
  }, [firestoreDoc])


  useEffect(() => {
    const unsubscribe = onSnapshot(firestoreCollection, (snapshot) => { 
      if(!snapshot.empty) {
        setNumberOfComments(snapshot.size)
      } else {
        setNumberOfComments(0)
      }
    }, (error) => {
      console.error(error.message)
    })
            
    return () => unsubscribe()
  }, [firestoreCollection])

  useEffect(() => {
    if (!user || profile) return

    const getProfile = async () => {
      try {
        await fetchProfile(user.uid, setProfile)
      } catch(error) {
        console.error("Error fetching profile:", error)
      } 
    }

    getProfile()
  }, [user?.uid])

  const isLiked = !!(likes && likes[user?.uid])
  const likesArray = Object.values(likes || {})
 /* const profileImgsArray = likesArray.map(like => like.photoURL)

  console.log(profileImgsArray)*/

  return (
    <div className="post-actions">
      <div>
        <div className="post-actions-buttons">
          <button onClick={handleLike} style={{display: 'flex', alignItems: 'center'}}>
            {
              isLiked ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" style={{width: '23px'}}>
                  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '23px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              )
            }
          </button>
          <button onClick={handleShowComments} style={{display: 'flex', alignItems: 'center'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            <span>{numberOfComments}</span>
          </button>
        </div>
        {
          likesArray.length > 0 && (
            <div 
              style={{
                fontSize: '.7rem', 
                display: 'flex', 
                alignItems: 'flex-end', 
                gap: '.3em', 
                padding: '1em 0 0', 
              }}
            >
              <div 
                className="avatar-stack" 
                style={{ width: `${15 * (likesArray.slice(0, 3).length - 1)}px` }}
              >
                {
                  likesArray.length > 0 &&
                  likesArray.slice(0, 3).map((item, index) => (
                    <img 
                      key={index} 
                      src={item.photoURL} 
                      alt="profile photo" 
                      className="user-img user-img-extra-small avatar" 
                      style={{ left: `${index * 15}px`, zIndex: likesArray.length - index }}
                    />
                  )) 
                }
              </div>
              <div
                onClick={handleShowLikes}
                style={{display: 'flex', alignItems: 'flex-end', gap: '.3em', cursor: 'pointer'}}
              >
                <span>Liked by</span>
                <span>{likesArray[0]?.displayName}</span>
                { likesArray.length === 2 && 'and 1 other' }
                { likesArray.length > 2 && `and ${likesArray.length - 1} others` }
              </div>
            </div>
          )
        }
        {error && <ErrorMessage message={error} />}
      </div> 
      { showLikes && (
        <PopUp setIsPopUpShown={setShowLikes}>
          {
           likesArray.length > 0 ? (
            likesArray.map((profileItem, index) => <UserCard key={index} userItem={profileItem} />)
           ) : 'nobody likes it'
          }
        </PopUp>
      ) }
      { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default FirestoreItemActions

