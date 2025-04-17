import { useState, useEffect, useRef } from "react"
import { database, ref, set, firestore, collection, query, addDoc, updateDoc, setDoc, getDocs, doc, where, serverTimestamp } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import uploadToCloudinaryAndGetUrl from "../../api/uploadToCloudinaryAndGetUrl"
import EmojiPicker from "emoji-picker-react"
import ChatSmiley from "../ChatSmiley"
import { ClipLoader } from "react-spinners"

const ChatBoxForm = ({messages, chatPartnerProfile, chatId}) => {
  const initialMessage = {text: '', image: ''}

  // Context
  const { user } = useAuth()

  // State
  const [message, setMessage] = useState(initialMessage)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false) 
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders 
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  // Firebase ref
  const typingRef = ref(database, `typingStatus/${chatId}/${user.uid}`)

  // Functions
  const handleMessageChange = (e) => {
    setMessage(prevMessage => ({...prevMessage, text: e.target.value}))
    handleTyping()
  }

  const handleEmojiClick = (emojiObject) => {
      setMessage(prevMessage => ({...prevMessage, text: prevMessage.text + emojiObject.emoji}))
  }

  const handleImageChange = (e) => {// je l ovde treba da se hendlaju greske?
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setMessage(prevMessage => ({...prevMessage, image: reader.result}))
      }
      reader.readAsDataURL(file)
    }
  }

  const sendMessage = async (userA, userBUid, receiverName, receiverPhoto, message) => {
    if(!chatId) return
    if(message.text || message.image) {
      let imageUrl = ''
      const chatsRef = collection(firestore, 'chats')
      const chatDoc = doc(chatsRef, chatId)
      const messagesRef = collection(chatDoc, "messages")

      setLoading(true)

      try {
        if(message.image) {
          imageUrl = await uploadToCloudinaryAndGetUrl(message.image)
        }
        const newMessage = {
          ...message,
          image: imageUrl
        }
        // Check if the chat exists, if not create it
        const chatSnapshot = await getDocs(query(chatsRef, where("__name__", "==", chatId)))
        if(chatSnapshot.empty) {
            // Chat doesn't exist, create a new one
            await setDoc(chatDoc, {
              participants: [userA.uid, userBUid],
              timestamp: serverTimestamp(),
              lastMessage: null
            })
        }
        // Add the message to the messages subcollection of the chat
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
                receiverPhoto,  
                receiverName,
                receiverUid: userBUid,
                //content: message.text || message.image, 
                contentText: message.text,
                contentImage: message.image,
                timestamp: serverTimestamp() },
          })
        console.log("Message sent successfully!")
      } catch(error) {
        console.error("Error sending message:", error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    try {
      await sendMessage(user, chatPartnerProfile.uid, chatPartnerProfile.displayName, chatPartnerProfile.photoURL, message)
    } catch(error) {
      console.error(error)
      setError(error) // mada ne znam sta ce biti error, da li ce ga biti, jer nije direktno firebase nego sendMessage
    } finally {
      setMessage(initialMessage)
      set(typingRef, false) // Stop typing indicator when message is sent
      setImagePreview(null)
    }
  }

  const handleTyping = () => {
    set(typingRef, true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      set(typingRef, false)
    }, 1500)
  }

  // Effects
  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages])

  return (
    <form>
      <label className="chat-box-main-label"> 
        <input 
          type='text'
          placeholder='Message...'
          value={message.text}
          onChange={handleMessageChange}
          style={{border: '0', fontSize: '1rem'}}
          ref={inputRef}
        />
        { imagePreview && <img src={imagePreview} alt="image-post" className="chat-box-image-preview" /> }
        <label className="chat-box-image-input-label">
          <button onClick={(e) => {e.preventDefault()}} className="chat-box-image-input-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="chat-box-image-icon" /*className="size-6" style={{width: '100%', color: 'salmon'}}*/>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>
          <input 
            type="file"
            accept="image/*"
            className="chat-box-image-input"
            onChange={handleImageChange}
          />
        </label>
        <ChatSmiley setShowEmojiPicker={setShowEmojiPicker}/>
      </label>
      {
        message.text || message.image ? (
          <button 
            onClick={(e) => handleSendMessage(e)}
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
      {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} className="chat-box-emoji-picker"/>}
    </form>
  )
}

export default ChatBoxForm