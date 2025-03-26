import { useState, useEffect } from "react"
import {
    firestore,
    collection,
    query,
    where,
    onSnapshot
} from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import { format } from "date-fns"
import fetchLinkPreview from "../api/fetchLinkPreview"
import extractUrls from "../utils/extractUrls"
import LinkPreview from "./LinkPreview"
import PopUp from "./PopUp"

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
      const urls = extractUrls(message.content.text)
      if (urls && urls.length > 0) {
        fetchLinkPreview(urls[0]).then(setLinkData) 
      } else {
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
          style={{
            width: 'fit-content',
            maxWidth: '50%',
            margin: '1em',
            marginLeft: message.senderName === user?.displayName ? 'auto' : '0',
            borderRadius: '30%',
            fontSize: '.7rem',
            textTransform: 'lowercase',
            display: 'flex'
          }}
          data-timestamp={message.timestamp}
          ref={(el) => (messageRefs.current[index] = el)} // Assign ref dynamically
        >
          <img 
            src={userProfile.photoURL} 
            alt="profile" 
            style={{
              width: '20px', 
              height: '20px',
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'inline', 
              borderRadius: '50%',
              alignSelf: 'start'
            }}
          />
          <div 
            style={{
              backgroundColor: message.senderName === user?.displayName ? 'salmon' : 'grey',
              padding: '.5em',
              borderRadius: '15px',
              width:'fit-content',
            }}
          >
            {
              linkData ? (
                <LinkPreview
                  linkData={linkData}
                />
              ) : (
                <div>
                  { 
                    message.content.text && <p>{message.content.text}</p>
                  }
                  {
                    message.content.image && (
                      <img
                        src={message.content.image}
                        alt="message-image"
                        style={{
                          cursor: 'pointer'
                        }}
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
            <p style={{textAlign: 'right'}}>{format(message.timestamp, "HH:mm")}</p>  
            {
              isLastIndex && message.senderUid === user.uid && message.status === "seen" && (
                <p style={{fontSize: '.6rem'}}>seen</p>
              )
            }
          </div>
        </div>
        {
          isImageViewerShown && (
            <PopUp
              setIsPopUpShown={setIsImageViewerShown}
            >
              <img
                src={message.content.image}
                alt="image viewer"
              />
            </PopUp>
          )
        }
      </>
    )
  )
}

export default Message