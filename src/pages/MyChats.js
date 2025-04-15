import { useState, useEffect } from "react"
import { firestore, collection, query, where, onSnapshot, doc, getDoc } from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import ChatBox from "../components/one_on_one_chat/ChatBox"
import ChatPreview from "../components/ChatPreview"
import ChatItemSkeleton from "../components/skeletons/ChatItemSkeleton"

const MyChats = () => {
    // Context
    const { user } = useAuth()
    
    // State
    const [chats, setChats] = useState([])
    const [chatPartnerProfile, setChatPartnerProfile] = useState(null)
    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
    const [chatPartnerUid, setChatPartnerUid] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    // Effects
    useEffect(() => {
      const chatsRef = collection(firestore, 'chats')
      const chatsQuery = query(chatsRef, where('participants', 'array-contains', user.uid))

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const chatsArray = snapshot.docs.map(doc => ({...doc.data()}))
        setChats(chatsArray)
        setLoading(false)
      })

      return () => unsubscribe
    }, [user.uid])

    useEffect(() => {
      if(chatPartnerUid) {
        const fetchProfile = async () => {
          const profileRef = doc(firestore, "profiles", chatPartnerUid)
          try {
            const snapshot = await getDoc(profileRef)
            if(snapshot.exists()) {
              setChatPartnerProfile(snapshot.data())
            }
          } catch(error) {
            console.error(error)
            setError(error)  
          } 
        }
        
        fetchProfile()
      }
    }, [chatPartnerUid])

    // Functions
    const pickChat = (chatPartnerUid, setIsChatBoxVisible) => {
      setIsChatBoxVisible(true)
      setChatPartnerUid(chatPartnerUid)
    }

    return (
      <div className="my-chats-container">
        {
          !isChatBoxVisible ? (
            <div>
              <h2>My chats</h2>
              {
                loading ? <ChatItemSkeleton /> : (
                  chats.length > 0 ? (
                    chats.map((chat, index) => {
                      const { receiverUid, receiverPhoto, receiverName, senderPhoto, senderName, contentText, contentImage, timestamp } = chat.lastMessage
                      const chatPartnerUid = chat.participants.filter(participant => participant !== user.uid)[0]
                      return (
                        <ChatPreview {...{
                          index,
                          chatPartnerUid, 
                          setIsChatBoxVisible, 
                          receiverUid, 
                          receiverPhoto, 
                          receiverName, senderPhoto, 
                          senderName, 
                          contentText, 
                          contentImage,
                          pickChat,
                          timestamp
                        }}/>
                      )
                      })
                  ) : (
                      <p>There's no chats yet.</p>
                  )
                )
              }
            </div>
          ) : <ChatBox {...{chatPartnerProfile, setIsChatBoxVisible}}/>
        }  
      </div>
    )
}
//Array(5).fill(0).map((_, i) => <ChatItemSkeleton key={i} />
export default MyChats
