import { useState, useEffect, useRef, useMemo } from "react"
import { firestore, collection, query, where, getDocs, updateDoc, ref, database, onValue } from "../../api/firebase"
import TypingIndicator from "./TypingIndicator"
import Message from "./Message"
import { useAuth } from "../../contexts/authContext"
import ChatBoxHeader from "./ChatBoxHeader"
import ChatBoxForm from "./ChatBoxForm"
import InfiniteScroll from "react-infinite-scroll-component"
import useChatMessages from "../../hooks/useChatMessages"
import { format } from "date-fns"
import { ClipLoader } from "react-spinners"
import ErrorMessage from "../errors/ErrorMessage"

const ChatBox = ({chatPartnerProfile, setIsChatBoxVisible}) => {
  // Context
  const { user } = useAuth()

  // State
  const [chatId, setChatId] = useState('')
  const [visibleDate, setVisibleDate] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Hooks that don't trigger re-renders 
  const chatRef = useRef(null)
  const messageRefs = useRef([])

  let lastDate = null

  // Memoized values
  const messagesRef = useMemo(() => {
    if (!chatId) return null
    return collection(firestore, "chats", chatId, "messages")
  }, [chatId])


  // Custom hooks
  const { data: messages, loading, error, fetchMore, hasMore, refetch } = useChatMessages(messagesRef, 15)


  // Effects
  /* generate chat id */
  useEffect(() => {
    const generatedChatId = [user?.uid, chatPartnerProfile?.uid].sort().join("_")
    setChatId(generatedChatId)
  }, [user?.uid, chatPartnerProfile?.uid])

  /* handle 'seen' status of a message */
  useEffect(() => {
    if(!chatId) return

    const markMessagesAsSeen = async () => { 
      try {
        const messagesRef = collection(firestore, "chats", chatId, "messages")
        const unseenMessagesQuery = query(
          messagesRef,
          where("receiverUid", "==", user.uid),
          where("status", "==", "sent")
        )
        const querySnapshot = await getDocs(unseenMessagesQuery)

        if(!querySnapshot.empty) {
          querySnapshot.forEach(async doc => {
            try {
              await updateDoc(doc.ref, {status: 'seen'})
            } catch(error) {
              console.error('Error updating message to seen:', error)
            }
          })
        }
      } catch(error) {
        console.error('Error marking messages as seen:', error)
      }
    }

    markMessagesAsSeen()
  }, [chatId, user?.uid, messages]) 


  /* chat-partner typing status */
  useEffect(() => {
    if (!chatId || !chatPartnerProfile) return

    const otherTypingRef = ref(database, `typingStatus/${chatId}/${chatPartnerProfile.uid}`)
    const unsubscribe = onValue(
      otherTypingRef, 
      (snapshot) => {
        setIsTyping(snapshot.val() === true)
      },
      (error) => {
        console.error('Error listening to typing status:', error)
      }
    )

    return () => unsubscribe()
  }, [chatId, chatPartnerProfile?.uid])


  /* handle chat scrolling */
  useEffect(() => {
    const handleScroll = () => {
      if (!chatRef.current || messageRefs.current.length === 0) return
  
      const chatTop = chatRef.current.getBoundingClientRect().top
  
      let closestMessage = null
      let closestDistance = Infinity
  
      messageRefs.current.forEach(ref => {
        if (!ref) return
  
        const rect = ref.getBoundingClientRect()
        const distance = Math.abs(rect.top - chatTop)
  
        if (rect.top >= chatTop && distance < closestDistance) {
          closestDistance = distance
          closestMessage = ref
        }
      })
  
      if (closestMessage) {
        const date = closestMessage.dataset.timestamp
        setVisibleDate(date)
      }
    }
  
    if (chatRef.current) {
      chatRef.current.addEventListener('scroll', handleScroll)
    }
  
    return () => {
      if (chatRef.current) {
        chatRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [messages])
  

  return (
    <div className="chat-box">
      <ChatBoxHeader {...{chatPartnerProfile, setIsChatBoxVisible}} />
      <div 
        className="chat-box-messages" 
        ref={chatRef}
        id="scrollableChatBoxDiv"
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMore}
          hasMore={hasMore}
          inverse={true}
          loader={null}
          scrollThreshold={0.9}
          endMessage={null}
          scrollableTarget="scrollableChatBoxDiv"
          style={{ display: "flex", flexDirection: "column-reverse", overflow: "visible" }}
        >
          <div>
            {
              loading ? (
                <ClipLoader color="#f29bbe" size={20} />
              ) : (
                messages.length > 0 && (
                  <div>
                    {
                    messages.map((message, index) => {
                      const messageDate = message.timestamp ? format(message.timestamp.toDate(), "dd/MM/yyyy") : ''
                    
                      const showDateDivider = lastDate !== messageDate
                      lastDate = messageDate
                  
                      const isLastIndex = index === messages.length - 1
                      return (
                        <Message 
                          key={index}
                          index={index}
                          message={message} 
                          showDateDivider={showDateDivider}
                          messageRefs={messageRefs}
                          messageDate={messageDate}
                          isLastIndex={isLastIndex}
                        />
                      )
                    })
                  }
                  </div>
                ) 
              )
            }
          </div>
        </InfiniteScroll>
        { messages.length > 0 && <p className="date">{visibleDate}</p> }
      </div>
      {isTyping && (
        <div className="typing-container">
          <span>{chatPartnerProfile.displayName} is typing</span>
          <TypingIndicator />
        </div>
      )}
      <ChatBoxForm {...{messages, chatPartnerProfile, chatId}}/>
      { error && <ErrorMessage message={error} isFatal={true} onRetry={refetch} /> }
    </div>
  )
}

export default ChatBox