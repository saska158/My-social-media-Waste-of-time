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

const Message = ({index, message, messageRefs, messageDate, isLastIndex, showDateDivider}) => {
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dsjpoak0f/upload"  
    const UPLOAD_PRESET = "profile_pictures"
    
    const { user } = useAuth()
    const [userProfile, setUserProfile] = useState(null)

    const [linkData, setLinkData] = useState(null)

    console.log("message iz message", message)


    useEffect(() => {
      if(message) {
        const urls = extractUrls(message.content.text)
        if (urls && urls.length > 0) {
          fetchLinkPreview(urls[0]).then(setLinkData) // We take the first URL from the input
        } else {
          setLinkData(null) // Clear preview if no URL is detected
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
                  {showDateDivider && (
                    <div className="date-divider">
                      <span style={{fontSize: '.6rem'}}>{messageDate}</span>
                    </div>
                  )}
                  <div 
                  //key={index} 
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
                    }}>
                    {
                      linkData ? (
                        <LinkPreview
                          linkData={linkData}
                        />
                      ) : (
                        <p>{message.content.text}</p>
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
                </>
        )
    )
}

export default Message