import { useState, useEffect } from "react"
import { firestore, collection, query, where, onSnapshot } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import { format } from "date-fns"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import linkify from "../../utils/linkify"
import LinkPreview from "../LinkPreview"

const Message = ({index, message, messageRefs, messageDate, isLastIndex, showDateDivider}) => {
  const { content, senderUid, senderName, timestamp } = message
  // Context
  const { user } = useAuth()

  // State
  const [userProfile, setUserProfile] = useState(null)
  const [linkData, setLinkData] = useState(null)

  
  // Effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const urls = extractUrls(content.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0])
          setLinkData(linkDetails)                            
        } else {
          setLinkData(null)
        }
      } catch(error) {
        console.error("Error fetching link preview:", error)
        setLinkData(null)
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
      } 
    }, (error) => {
      console.error("Error fetching user profile:", error)
    })
  
    return () => unsubscribe()
  }, [senderUid])


  return (
    userProfile && (
      <div style={{display: 'flex', flexDirection: 'column', whiteSpace: 'pre-wrap'}}>
        {
          showDateDivider && (
            <div className="date-divider">
              <span style={{fontSize: '.trem'}}>{messageDate}</span>
            </div>
          )
        }
        <div 
          className="message-container"
          style={{
            alignSelf: senderName.toLowerCase() === user?.displayName.toLowerCase() ? 'flex-end' : 'flex-start',
            justifyContent: senderName.toLowerCase() === user?.displayName.toLowerCase() ? 'flex-end' : 'flex-start'
          }}
          data-timestamp={messageDate}
          ref={(el) => (messageRefs.current[index] = el)} 
        >
          {
            senderName.toLowerCase() !== user?.displayName && (
              <img 
                src={userProfile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
                alt="profile" 
                className="user-img user-img-medium"
              />
            )
          }
          <div 
            className={content.image ? 'message-content-img' : "message-content"}
            style={{
              borderTopRightRadius: senderName.toLowerCase() === user?.displayName.toLowerCase() ? '0' : '15px',
              borderTopLeftRadius: senderName.toLowerCase() !== user?.displayName.toLowerCase() ? '0' : '15px',
            }}
          >
            <div>
              { content.text && <p>{linkify(content.text)}</p> }
              {
                content.image && <img src={content.image} className="message-img" alt="message-image" />
              }
            </div>
            { linkData && <LinkPreview {...{linkData, content}}/> } 
            {
              user && timestamp && <p style={{textAlign: 'right', fontSize: '.7rem', color: '#4b896f'}}>{format(timestamp.toDate(), 'p')}</p>
            }
            {
              isLastIndex && message.senderUid === user.uid && message.status === "seen" && (
                <p style={{fontSize: '.7rem', color: '#4b896f'}}>seen</p>
              )
            }
          </div>
        </div>
      </div>
    )
  )
}

export default Message