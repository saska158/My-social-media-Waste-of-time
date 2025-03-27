import { useState, useEffect, useRef } from "react"
import {
    firestore, 
    collection,
    query, 
    where, 
    getDocs, 
    updateDoc,
    set,
} from "../../api/firebase"
import Input from '../Input'
import Button from '../Button'
import TypingIndicator from "../TypingIndicator"
import Messages from "./Messages"
import { useAuth } from "../../contexts/authContext"
import ChatSmiley from "../ChatSmiley"
import ChatBoxHeader from "./ChatBoxHeader"
import EmojiPicker from "emoji-picker-react"
import { ClipLoader } from "react-spinners"
import useChat from "../../hooks/useChat"
import useTypingIndicator from "../../hooks/useTypingIndicator"

const ChatBox = ({chatPartnerUid, chatPartnerProfile, setIsChatBoxVisible}) => {
  const initialMessage = {
    text: '',
    image: ''
  }
  // Context
  const { user } = useAuth()
  

  // State
  const [chatId, setChatId] = useState('')
  const [message, setMessage] = useState(initialMessage)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [visibleDate, setVisibleDate] = useState("")
  const [error, setError] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Custom hook
  const { messages, sendMessage, loadingState } = useChat(chatId)
  const { isTyping, setIsTyping, handleTyping, typingRef } = useTypingIndicator(chatId, chatPartnerUid)

  console.log("isTyping", isTyping)


  // Hooks that don't trigger re-renders 
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  // Functions
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

  const handleSendMessage = async (e, user, chatPartnerUid, message) => {
    e.preventDefault()
    try {
      await sendMessage(user, chatPartnerUid, message)
    } catch(error) {
      console.error(error)
    } finally {
      setMessage(initialMessage)
      set(typingRef, false) // Stop typing indicator when message is sent
      setImagePreview(null)
    }
  }

  // Effects
  /* create or get the chatId when the component mounts or user UIDs change */
  useEffect(() => {
    const generatedChatId = [user?.uid, chatPartnerUid].sort().join("_")
    setChatId(generatedChatId)
  }, [user?.uid, chatPartnerUid])
  

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

  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages])

  /* listen for typing status of the other user */
  useEffect(() => {
    if (!chatId || !chatPartnerUid) return

    const otherTypingRef = ref(database, `typingStatus/${chatId}/${chatPartnerUid}`)
    const unsubscribe = onValue(otherTypingRef, (snapshot) => {
      setIsTyping(snapshot.val() === true)
    })

    return () => unsubscribe()
  }, [chatId, chatPartnerUid])
    
  return (
    <div className="chat-box" style={{position: 'relative', overflowX: 'hidden'}}>
      <ChatBoxHeader chatPartnerProfile={chatPartnerProfile} setIsChatBoxVisible={setIsChatBoxVisible} />
      <div className="chat-box-messages" ref={chatRef}>
        <span className="date">{visibleDate}</span>
        <Messages messages={messages} />
      </div>
      {isTyping && (
        <div style={{display: 'flex', alignItems: 'center'}}>
          <span>{chatPartnerProfile.displayName} is typing</span>
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
        > 
          <Input 
            type='text'
            placeholder='Message...'
            value={message.text}
            onChange={(e) => {
              setMessage(prevMessage => ({...prevMessage, text: e.target.value}))
              handleTyping()
            }}
            style={{border: '0', fontSize: '1rem'}}
            ref={inputRef}
          />
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
            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                cursor: 'pointer',
                width: '20px',
                height: '20px',
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
              />
            </label>
            <ChatSmiley setShowEmojiPicker={setShowEmojiPicker}/>
          </label>
          {
            message.text || message.image ? (
              <Button 
                onClick={(e) => handleSendMessage(e, user, chatPartnerUid, message)}
                style={{marginLeft: 'auto'}}
                disabled={loadingState.upload}
              >
                {
                  loadingState.upload ? (
                    <ClipLoader color="white"/>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px', color: 'white'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  )
                }
              </Button>
            ) : null
          }
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