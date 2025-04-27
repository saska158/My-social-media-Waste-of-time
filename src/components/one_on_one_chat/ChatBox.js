import { useState, useEffect, useRef, useMemo } from "react"
import { firestore, collection, query, where, getDocs, updateDoc, ref, database, onValue } from "../../api/firebase"
import TypingIndicator from "./TypingIndicator"
import Messages from "./Messages"
import Message from "./Message"
import { useAuth } from "../../contexts/authContext"
import ChatBoxHeader from "./ChatBoxHeader"
import ChatBoxForm from "./ChatBoxForm"
import InfiniteScroll from "react-infinite-scroll-component"
import useChatMessages from "../../hooks/useChatMessages"
import { format } from "date-fns"


const ChatBox = ({chatPartnerProfile, setIsChatBoxVisible}) => {
  console.log("rerendered")
  // Context
  const { user } = useAuth()

  // State
  const [chatId, setChatId] = useState('')
  const [visibleDate, setVisibleDate] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)

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
  const { data: messages, loading, fetchMore, hasMore } = useChatMessages(messagesRef, 15)

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

  useEffect(() => {
    const handleScroll = () => {
      if(!messageRefs.current.length) return

      const chatTop = chatRef.current.getBoundingClientRect().top
      messageRefs.current.forEach(ref => {
        const refTop = ref.getBoundingClientRect().top

        if(refTop >= chatTop) {
          const date = ref.dataset.timestamp
          setVisibleDate(date)
        }
      })
    }

    if(chatRef.current) {
      chatRef.current.addEventListener('scroll', handleScroll)
    }

    return () => {
      if(chatRef.current) {
        chatRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])
  
    
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
            {/* razmisli o ovome */}
            {/*loading && <ClipLoader color="salmon" size={20} style={{ alignSelf: 'center', margin: '10px 0' }} />*/}
            {/*!hasMore && (
              <p style={{ textAlign: 'center', margin: '10px 0', color: '#999' }}>
                Yay! You have seen it all
              </p>
            )*/}
            {
              loading ? <p>loading...</p> : (
                //messages.length > 0 ? <Messages {...{messages}} /> : <p>No messages yet</p>
                messages.length > 0 && (
                  <>
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
                  </>
                ) //: <p>No messages yet</p>
              )
            }
          </div>
        </InfiniteScroll>
        {
          messages.length > 0 && <p className="date">{visibleDate}</p>
        }
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