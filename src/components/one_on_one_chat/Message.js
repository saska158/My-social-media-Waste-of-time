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
import linkify from "../../utils/linkify"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"

const Message = ({index, message, messageRefs, messageDate, isLastIndex, showDateDivider}) => {
  const { content, senderUid, senderName, timestamp } = message
  // Context
  const { user } = useAuth()
  
  // State
  const [userProfile, setUserProfile] = useState(null)
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Effects
  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        const urls = extractUrls(content.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0]) //mislim da je ovo primer kako sam resila
          setLinkData(linkDetails)                            // pomocu async/await tamo gde imam .then() 
        }
      } catch(error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [content.text])
    
  useEffect(() => {
    const profilesRef = collection(firestore, "profiles")
    const q = query(profilesRef, where("uid", "==", senderUid))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if(!snapshot.empty) {
        setUserProfile(snapshot.docs[0].data())
      } else {
        console.log("Profile not found")
      }
    })
  
    return () => unsubscribe()
  }, [senderUid])

  return (
    userProfile && (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {
          showDateDivider && (
            <div className="date-divider">
              <span style={{fontSize: '.6rem'}}>{messageDate}</span>
            </div>
          )
        }
        <div 
          className="message-container"
          style={{
            alignSelf: senderName === user?.displayName ? 'flex-end' : 'flex-start',
            justifyContent: senderName === user?.displayName ? 'flex-end' : 'flex-start'
          }}
          //data-timestamp={message.timestamp}
          data-timestamp={messageDate}
          ref={(el) => (messageRefs.current[index] = el)} // Assign ref dynamically
        >
          {
            senderName !== user?.displayName && (
              <img 
                src={userProfile.photoURL} 
                alt="profile" 
                className="message-profile-image"
              />
            )
          }
          <div 
            className="message-content"
            style={{backgroundColor: senderName === user?.displayName ? 'salmon' : 'grey'}}
          >
            <div>
              { content.text && <p>{linkify(content.text)}</p> }
              {
                content.image && (
                  <img
                    src={content.image}
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
            { linkData && <LinkPreview {...{linkData, content}}/> } 
            {
              timestamp && <p style={{textAlign: 'right'}}>{format(timestamp.toDate(), 'p')}</p>
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
              <img src={content.image} alt="image viewer" />
            </PopUp>
          )
        }
      </div>
    )
  )
}

export default Message