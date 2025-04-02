import { useState, useEffect } from "react"
import { 
    firestore,
    collection,
    doc,
    getDoc,
    query,
    where,
    onSnapshot
 } from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import ChatBox from "../components/one_on_one_chat/ChatBox"
import ChatItem from "../components/ChatItem"

const MyChats = () => {
    // Context
    const { user } = useAuth()
    
    // State
    const [chats, setChats] = useState([])
    const [isChatBoxVisible, setIsChatBoxVisible] = useState(false)
    const [chatPartner, setChatPartner] = useState({ 
        uid: '',
        profile: ''
    })

    // Effects
    useEffect(() => {
      if (!user.uid) return

      const chatsRef = collection(firestore, 'chats')
      const chatsQuery = query(chatsRef, where('participants', 'array-contains', user.uid))

      const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
        const chatData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const chat = docSnap.data()

            // Find the other participant
            const chatPartnerUid = chat.participants.find(uid => uid !== user.uid)

            // Fetch the other user's profile
            const chatPartherRef = doc(firestore, 'profiles', chatPartnerUid)
            const chatPartnerSnap = await getDoc(chatPartherRef)
            const chatPartnerData = chatPartnerSnap.exists() ? chatPartnerSnap.data() : null

            return {
              id: docSnap.id,
              lastMessage: chat.lastMessage || null,
              chatPartnerUid,
              chatPartner: chatPartnerData,
              timestamp: docSnap.data().createdAt ? docSnap.data().createdAt.toDate() : null
            }
          })
        )
        setChats(chatData)
      })

      return () => unsubscribe
    }, [user.uid])

    return (
        <div className="my-chats-container">
          {
            !isChatBoxVisible ? (
              <div>
                <h2>My chats</h2>
                {
                  chats.length > 0 ? (
                    chats.map((chat, index) => <ChatItem 
                                                key={index} 
                                                {...{ chat, setIsChatBoxVisible, setChatPartner }} 
                                               />
                    )
                  ) : <p>You still don't have any chats.</p>
                }
              </div>
            ) : (
              <ChatBox 
                chatPartnerUid={chatPartner.uid} 
                chatPartnerProfile={chatPartner.profile} 
                setIsChatBoxVisible={setIsChatBoxVisible} 
              />
            )
          }
          
        </div>
    )
}

export default MyChats