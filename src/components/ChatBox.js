import { useState, useEffect, useRef } from "react"
import {
    firestore, 
    collection,
    doc, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    setDoc,
    updateDoc,
    serverTimestamp,
    orderBy, 
    onSnapshot,
    limit,
    startAfter,
    database,
    set,
    onValue,
    ref
} from "../api/firebase"
import { format } from "date-fns"
import Input from './Input'
import Button from './Button'
import TypingIndicator from "./TypingIndicator"
import Message from "./Message"
import { useAuth } from "../contexts/authContext"
import ChatSmiley from "./ChatSmiley"
import EmojiPicker from "emoji-picker-react"
import uploadToCloudinaryAndGetUrl from "../api/uploadToCloudinaryAndGetUrl"


//OBAVEZNO DA IZMENIM OVO PROFILEUID U OTHERUSERUID I SVE U SKLADU SA TIME
//SVE JE NECITLJIVO I KONFUZNO ZBOG TOGA 
const ChatBox = ({profileUid, profile, setIsChatBoxVisible}) => {
    const { user } = useAuth()
    const [chatId, setChatId] = useState('')
    const initialMessage = {
      text: '',
      image: ''
    }
    const [message, setMessage] = useState(initialMessage)
    const [messages, setMessages] = useState([])
    const [lastVisible, setLastVisible] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const [initialLoad, setInitialLoad] = useState(true)
    const [isFetchingOldMessages, setIsFetchingOldMessages] = useState(false)

    const [visibleDate, setVisibleDate] = useState("")

    const [isTyping, setIsTyping] = useState(false)

    const typingRef = ref(database, `typingStatus/${chatId}/${user.uid}`)
    const typingTimeoutRef = useRef(null)

    const chatRef = useRef(null)
    const messageRefs = useRef([])
    const imageInputRef = useRef(null)
    const [imagePreview, setImagePreview] = useState(null)

    const [error, setError] = useState(null)

    //for initializing the visibleDate when chatBox mounts
    const initialized = useRef(false)


    // Create or get the chatId when the component mounts or user UIDs change
    useEffect(() => {
        const generatedChatId = [user?.uid, profileUid].sort().join("_")
        setChatId(generatedChatId)
    }, [user?.uid, profileUid])


    // Real-time listener for fetching messages
    
    useEffect(() => {
        if(!chatId) return

        const messagesRef = collection(firestore, "chats", chatId, "messages")
        const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(10))
        //console.log("messages q:", messagesQuery) 

        
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            if(!snapshot.empty) {
                const newMessages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null //sto??
                }))
                setMessages(newMessages.reverse())
                setLastVisible(snapshot.docs[snapshot.docs.length - 1])

                //markMessagesAsSeen(newMessages)

            }
        })
        return () => unsubscribe()
    }, [chatId])

   

    const loadMoreMessages = () => {
        if (loading || !lastVisible) return
        setLoading(true)

        setIsFetchingOldMessages(true) // Prevent auto-scroll

        const chatBox = chatRef.current
        const scrollPosition = chatBox.scrollTop

    
        const messagesRef = collection(firestore, "chats", chatId, "messages")
        const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), startAfter(lastVisible || 0), limit(10))

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          if (!snapshot.empty) {
            const newMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null //sto??
            })).reverse()
            setMessages(prevMessages => [ ...newMessages, ...prevMessages]) // Append older messages
            setLastVisible(snapshot.docs[snapshot.docs.length - 1])
          } 

          setTimeout(() => {
            // Maintain scroll position
            chatBox.scrollTop = scrollPosition + 10
          }, 0)
    
          setIsFetchingOldMessages(false)
          setLoading(false)

        })
      
        return () => unsubscribe()
    }
      

    const handleScroll = () => {
        if(chatRef.current) {
            const chatBox = chatRef.current
            //console.log(chatBox.scrollTop)
            
            // Check if user scrolled to the top
            if(chatBox.scrollTop === 0) {
                loadMoreMessages()
                //console.log("TOP")
            }
        }
    }

      
    useEffect(() => {
        const chatBox = chatRef.current
        if(chatBox) {
            chatBox.addEventListener("scroll", handleScroll)
            return () => chatBox.removeEventListener("scroll", handleScroll)
        }
    }, [messages])

    useEffect(() => {
        if(messages.length < 11) {
            const chatBox = chatRef.current
        
            if (messages.length > 0) {
                if (initialLoad) {
                    // First load -> scroll to bottom
                    setTimeout(() => {
                        chatBox.scrollTop = chatBox.scrollHeight
                    }, 0)
                    setInitialLoad(false)
                } else if (!isFetchingOldMessages) {
                    // New message sent -> scroll to bottom
                    setTimeout(() => {
                        chatBox.scrollTop = chatBox.scrollHeight
                    }, 0)
                }
            }
        }
    }, [messages])
  
    const sendMessage = async (e, userA, userBUid) => {
      e.preventDefault()
      //treba da dodas da ne moze da se posalje prazna poruka
      if(message.text || message.image) {
        const imageFile = imageInputRef.current.files[0]
        let imageUrl = ''

        if(imageFile) {
          try {
            imageUrl = await uploadToCloudinaryAndGetUrl(imageFile)
          } catch(error) {
            console.error("Getting url failed:", error)
            setError(error)
          } 
        }

        const newMessage = {
          ...message,
          image: imageUrl
        }

        try {
          const chatsRef = collection(firestore, 'chats')
          const chatDoc = doc(chatsRef, chatId)

          // Ensure consistent order for user IDs (e.g., 'user1_user2' and 'user2_user1' are treated the same)
          //const chatId = [userAUid, userBUid].sort().join("_")

          // Check if the chat exists, if not create it
          const chatSnapshot = await getDocs(query(chatsRef, where("__name__", "==", chatId)))
          
          if(chatSnapshot.empty) {
              // Chat doesn't exist, create a new one
              await setDoc(chatDoc, {
                  participants: [userA.uid, userBUid],
                  createdAt: serverTimestamp(),
                  lastMessage: null
              })
          }

          // Add the message to the messages subcollection of the chat
          const messagesRef = collection(chatDoc, "messages")
          await addDoc(messagesRef, {
              receiverUid: userBUid,
              senderUid: userA.uid,
              senderName: userA.displayName,
              senderPhoto: userA.photoURL,
              content: newMessage,
              timestamp: serverTimestamp(),
              status: 'sent' 
          })

          //update the lastMessage field in the chat document
          await updateDoc(chatDoc, {
              lastMessage: {  
                  senderUid: userA.uid,
                  senderName: userA.displayName,
                  senderPhoto: userA.photoURL,
                  content: message.text, 
                  timestamp: serverTimestamp() },
            })

          setMessage(initialMessage)
          set(typingRef, false) // Stop typing indicator when message is sent
          console.log("Message sent successfully!")
      } catch(error) {
          console.error("Error sending message:", error)
      } finally {
        setImagePreview(null)
      }
      }
    }


    useEffect(() => {
        if(!chatId) return
        const markMessagesAsSeen = async () => {
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
    }, [chatId, user.uid, messages])
  


    // Handling date based on scrolling

    useEffect(() => {
        const chatBox = chatRef.current
        if(!chatBox) return

        // Create an Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            for(const entry of entries) {
                if(entry.isIntersecting) {
                    const timestamp = entry.target.getAttribute("data-timestamp")
                    if(timestamp) {
                        setVisibleDate(format(timestamp, "dd/MM/yyyy"))
                    }
                    break  // Stop checking after first visible message
                }
            }
        },
        { root: chatBox, threshold: 0 }) // Adjust threshold as needed

        // Observe each message
        messageRefs.current.forEach((message) => {
            if(message instanceof Element) {
                observer.observe(message)
            }
        })

        return () => {
            if (!chatBox) return // Ensure the chat box still exists
            messageRefs.current.forEach((message) => {
                if(message instanceof Element) {
                    observer.unobserve(message)
                }
            })
        }
    }, [messages])

    // Listen for typing status of the other user
    useEffect(() => {
      if (!chatId || !profileUid) return

      const otherTypingRef = ref(database, `typingStatus/${chatId}/${profileUid}`)
      const unsubscribe = onValue(otherTypingRef, (snapshot) => {
        setIsTyping(snapshot.val() === true)
      })

      return () => unsubscribe()
    }, [chatId, profileUid])
  

    // Handle typing indicator
    const handleTyping = () => {
      set(typingRef, true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        set(typingRef, false)
    }, 1500)
    }

    const handleEmojiClick = (emojiObject) => {
        setMessage(prevMessage => ({...prevMessage, text: prevMessage.text + emojiObject.emoji}))
    }

    const handleImageChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          console.log("result", reader.result)
          setImagePreview(reader.result)
          setMessage(prevMessage => ({...prevMessage, image: reader.result}))
        }
        reader.readAsDataURL(file)
      }
    }


    const renderMessages = () => {
        let lastDate = null

        return messages.map((message, index) => {
          const messageDate = message.timestamp ? format(message.timestamp, "dd/MM/yyyy") : ''
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

    return (
        <div className="chat-box" style={{position: 'relative'}}>
            <div style={{
                position: 'sticky', 
                top: '0', 
                left: '0', 
                right: '0', 
                background: 's', 
                borderBottom: '1px solid black'
            }}>
              <button onClick={() => setIsChatBoxVisible(false)}>x</button>
              <p>
                { profile.displayName }
              </p>
            </div>
            {/* Display messages */}
            <div className="chat-box-messages" ref={chatRef}>
                <span className="date">{visibleDate}</span>
                {renderMessages()}
            </div>
         
            {/* Show typing indicator if the other user is typing */}
            {isTyping && (
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span>{profile.displayName} is typing</span>
                <TypingIndicator />
              </div>
            )}

            <form style={{display: 'flex'}}>
                <label 
                  style={{
                    border: '.3px solid salmon', 
                    borderRadius: '20px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                > {/* label da obuhvati input za tekst, za sliku i smajlije */}
                <Input 
                  type='text'
                  placeholder='...'
                  value={message.text}
                  onChange={(e) => {
                    setMessage(prevMessage => ({...prevMessage, text: e.target.value}))
                    handleTyping()
                  }}
                  style={{border: '0', fontSize: '1rem'}}
                />

                {/* image preview */}
                {
                  imagePreview && (
                    <img
                      src={imagePreview}
                      alt="image-post"
                      style={{
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover', 
                        objectPosition: 'top',
                        margin: '.5em'
                      }}
                    />
                  )
                }
                {/* ovo je za slike */}
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    cursor: 'pointer',
                    //borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    //background: 'blue'
                  }}
                >
                  <Button
                    onClick={(e) => {e.preventDefault()}}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      padding: '0'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '100%', color: 'salmon'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </Button>
                  <input 
                    type="file"
                    accept="image/*"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      opacity: '0'
                    }}
                    onChange={handleImageChange}
                    ref={imageInputRef}
                  />
                </label>
                {/* ovo je za smajlije */}
                <ChatSmiley setShowEmojiPicker={setShowEmojiPicker}/>
                </label>
                <Button 
                  onClick={(e) => sendMessage(e, user, profileUid)}
                  style={{marginLeft: 'auto'}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px', color: 'white'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </Button>

                {
                    showEmojiPicker && (
                        <div>
                            <EmojiPicker 
                                onEmojiClick={handleEmojiClick} 
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    width: '60%',
                                    height: '60%' 
                                }}
                            />
                        </div>
                    )
                }
            </form>
        </div>
    )
}

export default ChatBox