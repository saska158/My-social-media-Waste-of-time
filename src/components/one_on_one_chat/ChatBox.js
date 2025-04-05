import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { firestore, collection, query, where, getDocs, updateDoc, ref, database, onValue } from "../../api/firebase"
import TypingIndicator from "./TypingIndicator"
import Messages from "./Messages"
import { useAuth } from "../../contexts/authContext"
import ChatBoxHeader from "./ChatBoxHeader"
import ChatBoxForm from "./ChatBoxForm"
import useMessages from "../../hooks/useMessages"
import useInfiniteScroll from "../../hooks/useInfiniteScroll"


const ChatBox = ({/*chatPartnerUid,*/ chatPartnerProfile, setIsChatBoxVisible}) => {
  // Context
  const { user } = useAuth()

  // State
  const [chatId, setChatId] = useState('')
  const [visibleDate, setVisibleDate] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  console.log("partner", chatPartnerProfile)

  // Hooks that don't trigger re-renders 
  const chatRef = useRef(null)

  // Custom hooks
  const { messages, fetchMoreMessages, hasMore } = useMessages(chatId)
  //useInfiniteScroll(fetchMoreMessages, hasMore, chatRef)

  // Effects
  /* create or get the chatId when the component mounts or user UIDs change */
  useEffect(() => {
    const generatedChatId = [user?.uid, chatPartnerProfile?.uid].sort().join("_")
    setChatId(generatedChatId)
  }, [user?.uid, chatPartnerProfile?.uid])


  useEffect(() => {
    if(!chatId) return
    const markMessagesAsSeen = async () => { //nemas try/catch
      const messagesRef = collection(firestore, "chats", chatId, "messages")
      const unseenMessagesQuery = query(
        messagesRef,
        where("receiverUid", "==", user.uid),
        where("status", "==", "sent")
      )
      const querySnapshot = await getDocs(unseenMessagesQuery)
      querySnapshot.forEach(async doc => {
        await updateDoc(doc.ref, {status: 'seen'})
      })
    }

    markMessagesAsSeen()
  }, [chatId, user?.uid, messages]) 

  useEffect(() => {
    if (!chatId || !chatPartnerProfile) return

    const otherTypingRef = ref(database, `typingStatus/${chatId}/${chatPartnerProfile.uid}`)
    const unsubscribe = onValue(otherTypingRef, (snapshot) => {
      setIsTyping(snapshot.val() === true)
    })

    return () => unsubscribe()
  }, [chatId, chatPartnerProfile?.uid])

  useLayoutEffect(() => {
    const chatBox = chatRef.current
    console.log(chatBox)
    const timeoutId = setTimeout(() => {
      if(chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [messages])

    
  return (
    <div className="chat-box">
      <ChatBoxHeader {...{chatPartnerProfile, setIsChatBoxVisible}} />
      <div className="chat-box-messages" ref={chatRef}>
        <span className="date">{visibleDate}</span>
        <Messages {...{messages}} />
      </div>
      {isTyping && (
        <div className="typing-container">
          <span>{chatPartnerProfile.displayName} is typing</span>
          <TypingIndicator />
        </div>
      )}
      <ChatBoxForm {...{messages, chatPartnerProfile, chatId}}/>
    </div>
  )
}

export default ChatBox