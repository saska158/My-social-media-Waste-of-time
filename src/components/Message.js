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

const Message = ({index, message, messages, /*lastDate,*/ messageRefs}) => {
    
    const { user } = useAuth()
    const [userProfile, setUserProfile] = useState(null)
    let lastDate

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

    const messageDate = message.timestamp ? format(message.timestamp, "dd/MM/yyyy") : ''
    const showDateDivider = lastDate !== messageDate
    lastDate = messageDate
    
    const isLastIndex = index === messages.length - 1

    return (
        userProfile && (
            <>
                  {showDateDivider && (
                    <div className="date-divider">
                      <span style={{fontSize: '.6rem'}}>{messageDate}</span>
                    </div>
                  )}
                  <div 
                  key={index} 
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
                    <p>{message.content}</p>
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