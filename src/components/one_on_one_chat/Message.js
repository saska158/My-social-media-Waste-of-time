import { useState, useEffect } from "react"
import {
    firestore,
    collection,
    query,
    where,
    onSnapshot
} from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import { format } from "date-fns"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"

const Message = ({index, message, messageRefs, messageDate, isLastIndex, showDateDivider}) => {
  // Context
  const { user } = useAuth()
  
  // State
  const [userProfile, setUserProfile] = useState(null)
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)

  // Effects
  useEffect(() => {
    if(message) {
      const urls = extractUrls(message.content.text) // treba li greska? ili je u okviru extractUrls
      if (urls && urls.length > 0) {
        fetchLinkPreview(urls[0]).then(setLinkData)  // ovde sigurno treba, nema catch. mislim da sam negde
      } else {                                       // vec napravila sa async/await
          setLinkData(null) 
      }
    }
  }, [message.content.text])
    
  useEffect(() => {
    const profilesRef = collection(firestore, "profiles")
    const q = query(profilesRef, where("uid", "==", message.senderUid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if(!snapshot.empty) {
        setUserProfile(snapshot.docs[0].data())
      } else {
        console.log("Profile not found")
      }
    })
  
    return () => unsubscribe()
  }, [message.senderUid])

  return (
    userProfile && (
      <>
        {
          showDateDivider && (
            <div className="date-divider">
              <span style={{fontSize: '.6rem'}}>{messageDate}</span>
            </div>
          )
        }
        <div 
          className="message-container"
          style={{marginLeft: message.senderName === user?.displayName ? 'auto' : '0'}}
          //data-timestamp={message.timestamp}
          data-timestamp={messageDate}
          ref={(el) => (messageRefs.current[index] = el)} // Assign ref dynamically
        >
          <img 
            src={userProfile.photoURL} 
            alt="profile" 
            className="message-profile-image"
          />
          <div 
            className="message-content"
            style={{backgroundColor: message.senderName === user?.displayName ? 'salmon' : 'grey'}}
          >
            {
              linkData ? <LinkPreview {...{linkData}}/> : (
                <div>
                  { message.content.text && <p>{message.content.text}</p> }
                  {
                    message.content.image && (
                      <img
                        src={message.content.image}
                        alt="message-image"
                        style={{cursor: 'pointer'}}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsImageViewerShown(true)
                        }}
                      />
                    )
                  }
                </div>
              )
            }
            {
              message?.timestamp && <p style={{textAlign: 'right'}}>{format(message.timestamp.toDate(), 'p')}</p>
            }
            {/*
              isLastIndex && message.senderUid === user.uid && message.status === "seen" && (
                <p style={{fontSize: '.6rem'}}>seen</p>
              )
            */}
          </div>
        </div>
        {
          isImageViewerShown && (
            <PopUp setIsPopUpShown={setIsImageViewerShown}>
              <img src={message.content.image} alt="image viewer" />
            </PopUp>
          )
        }
      </>
    )
  )
}

export default Message