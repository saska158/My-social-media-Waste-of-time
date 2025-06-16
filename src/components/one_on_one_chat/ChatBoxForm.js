import { useState, useEffect, useRef } from "react"
import { database, ref, set } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import EmojiPicker from "emoji-picker-react"
import ChatSmiley from "../ChatSmiley"
import ImageUploadButton from "../ImageUploadButton"
import ImagePreview from "../ImagePreview"
import LinkPreview from "../LinkPreview"
import { ClipLoader } from "react-spinners"
import ErrorMessage from "../errors/ErrorMessage.js"
import Textarea from "../Textarea.js"
import sendMessageToFirestore from "../../api/sendMessageToFirestore.js"
import { readImageAsDataURL } from "../../utils/readImageAsDataURL"
import useTypingIndicator from "../../hooks/useTypingIndicator"
import extractUrls from "../../utils/extractUrls"
import fetchLinkPreview from "../../api/fetchLinkPreview"

const ChatBoxForm = ({messages, chatPartnerProfile, chatId}) => {
  const initialMessage = {text: '', image: ''}

  // Context
  const { user } = useAuth()

  // State
  const [message, setMessage] = useState(initialMessage)
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false) 
  const [linkData, setLinkData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders 
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const linkPreviewRef = useRef(null) 
  const textareaRef = useRef(null)

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

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
      setLinkData(null)
      fileInputRef.current.value = null
    } catch (error) {
      console.error("Error sending message:", error)

      let errorMessage

      if (error.code === 'permission-denied') {
        errorMessage = "You don’t have permission to send this message."
      } else if (error.code === 'unavailable') {
        errorMessage = "Network issue. Please try again."
      } else {
        errorMessage = "Something went wrong. Please try again."
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const cancelLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLinkData(null)
  }

  // Effects
  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages])

  useEffect(() => {
    if(!message.text) return
    
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const urls = extractUrls(message.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0]) 
          setLinkData(linkDetails)                             
        }
      } catch(error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [message.text])


  return (
    <form style={{display: 'flex', flexDirection: 'column-reverse', padding: '1em'}}>
      { error && <ErrorMessage message={error} /> }

      <div style={{display: 'flex', alignItems: 'center', gap: '2em'}}>
        <Textarea
          value={message.text}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          textareaRef={textareaRef}
          style={{width: '50%'}}
          maxLength={1000}
        />

        <div style={{display: 'flex', alignItems: 'center', width: '50%'}}>
          <ImageUploadButton {...{handleImageChange, fileInputRef}} />
          <div style={{position: 'relative'}}>
            <ChatSmiley setShowEmojiPicker={setShowEmojiPicker} />
            {
              showEmojiPicker && (
                <EmojiPicker 
                 onEmojiClick={handleEmojiClick} 
                 style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: '0',
                  marginBottom: '.25em',
                  zIndex: '1000',
                  overflow: 'hidden'
                 }}
                />
              )
            }
          </div>
  
          {
            message.text || message.image ? (
              <button onClick={handleSendMessage} disabled={loading} style={{marginLeft: 'auto'}} className="no-padding-btn">
                {
                  loading ? (
                    <ClipLoader color="#4b896f"/>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px', color: '#4b896f'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  )
                }
              </button>
            ) : null
          }
        </div>
      </div>

      {
        linkData && (
          <LinkPreview {...{linkData}} content={message} style={{display: 'flex', alignItems: 'flex-start'}} imgStyle={{width: '30%'}}>
            <button onClick={cancelLink} style={{position: 'absolute', top: '0', right: '0'}}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '15px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </LinkPreview>
        )
      }

      { imagePreview && <ImagePreview {...{imagePreview, setImagePreview, fileInputRef}} setState={setMessage} /> }
    </form>
  )
}

export default ChatBoxForm

