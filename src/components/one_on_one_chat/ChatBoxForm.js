import { useState, useEffect, useRef } from "react"
import { database, ref, set } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import EmojiPicker from "emoji-picker-react"
import ChatSmiley from "../ChatSmiley"
import ImageUploadButton from "../ImageUploadButton"
import ImagePreview from "../ImagePreview"
import { ClipLoader } from "react-spinners"
import { sendMessageToFirestore } from "../../api/chatApi"
import { readImageAsDataURL } from "../../utils/readImageAsDataURL"
import useTypingIndicator from "../../hooks/useTypingIndicator"

const ChatBoxForm = ({messages, chatPartnerProfile, chatId}) => {
  const initialMessage = {text: '', image: ''}

  // Context
  const { user } = useAuth()

  // State
  const [message, setMessage] = useState(initialMessage)
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false) 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders 
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Firebase ref
  const typingRef = ref(database, `typingStatus/${chatId}/${user.uid}`)

  // Custom hooks
  const handleTyping = useTypingIndicator(chatId, user.uid)


  // Functions
  const handleMessageChange = (e) => {
    setMessage(prevMessage => ({...prevMessage, text: e.target.value}))
    handleTyping()
  }

  const handleEmojiClick = (emojiObject) => {
      setMessage(prevMessage => ({...prevMessage, text: prevMessage.text + emojiObject.emoji}))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    readImageAsDataURL(
      file,
      (dataURL) => {
        setImagePreview(dataURL)
        setMessage(prev => ({...prev, image: dataURL}))
      },
      (error) => {
        setError(error)
      }
    )
  }

  const handleSendMessage = async (e) => {
    console.log('sent')
    e.preventDefault()
    setLoading(true)
    try {
      await sendMessageToFirestore(
        chatId,
        user, 
        chatPartnerProfile.uid, 
        chatPartnerProfile.displayName, 
        chatPartnerProfile.photoURL, 
        message
      )
      setMessage(initialMessage)
      setImagePreview(null)
      set(typingRef, false)
      setShowEmojiPicker(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  // Effects
  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages])

  return (
    <form style={{position: 'relative'}}>
      <label className="chat-box-main-label"> 
        <input 
          type='text'
          placeholder='Message...'
          value={message.text}
          onChange={handleMessageChange}
          style={{border: '0', fontSize: '1rem'}}
          ref={inputRef}
        />
        { imagePreview && <ImagePreview {...{imagePreview}} /> }
        <ImageUploadButton {...{handleImageChange}} />
        <ChatSmiley setShowEmojiPicker={setShowEmojiPicker}/>
      </label>
      {
        message.text || message.image ? (
          <button 
            onClick={handleSendMessage}
            style={{marginLeft: 'auto'}}
            disabled={loading}
          >
            {
              loading ? (
                <ClipLoader color="white"/>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px', color: 'white'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              )
            }
          </button>
        ) : null
      }

      {showEmojiPicker && (
        <EmojiPicker 
          onEmojiClick={handleEmojiClick} 
          style={{
            position: 'fixed',
            bottom: '10%',
            left: '10%',
            width: '30%',
          }}
        />
      )}        
    </form>
  )
}

export default ChatBoxForm