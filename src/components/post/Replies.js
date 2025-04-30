import { useState, useRef } from "react"
import { addDoc, serverTimestamp } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import EmojiPicker from "emoji-picker-react"
import LinkPreview from "../LinkPreview"
import ImagePreview from "../ImagePreview"
import ImageUploadButton from "../ImageUploadButton"
import ChatSmiley from "../ChatSmiley"
import { ClipLoader } from "react-spinners"

const Replies = ({comment, replies, commentRef}) => {
  const initialReply = {
    text: '',
    image: ''
  }

  // Context
  const { user } = useAuth()

  // State
  const [reply, setReply] = useState(initialReply)
  const [linkData, setLinkData] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loadingNewReply, setLoadingNewReply] = useState(false)
  const [error, setError] = useState(null)


  // Hooks that don't trigger re-renders 
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Functions
  const handleReply = (e) => {
    setReply(prev => ({...prev, text: e.target.value}))
  }
  const addReply = async (e) => {
    console.log("reply")
    e.preventDefault()
    if(!reply.text && ! reply.image) return
    //const commentRef = collection(firestore, room, id, 'comments', commentId, 'replies')

    try {
      const newReplyData = {
        userId: user.uid,
        name: user.displayName,
        photoURL: user.photoURL,
        content: reply,
        likes: [],
        timestamp: serverTimestamp()
      }
      await addDoc(commentRef, newReplyData)
      setReply(initialReply)  
      setImagePreview(null)
      setLinkData(null)
      fileInputRef.current.value = null
    } catch(error) {
      console.error("Error sending comment", error)
      setError(error)
    } finally {
      setLoadingNewReply(false)
    }

  }
  const cancelLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLinkData(null)
  }
  return (
    <div>
      <div>
        {
            replies.length > 0 ? (
                replies.map(reply => <p>{reply.content.text}</p>)
            ) : (<p>no replies</p>)
        }
      </div>
      <form onSubmit={addReply} className="comments-form">
        <label className="comments-main-label">
          {
            linkData && (
              <LinkPreview {...{linkData}} style={{display: 'flex', alignItems: 'flex-start'}} imgStyle={{width: '30%'}}>
                <button onClick={cancelLink}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '15px'}} /*className="size-6"*/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </LinkPreview>
            )
          }    
          <div style={{display: 'flex'}}>
            <img src={user.photoURL} alt="profile-img" className="comment-profile-image" />
            <input
              type="text"
              placeholder={`Reply to ${comment?.name}`}
              value={reply.text}
              onChange={handleReply}
              style={{border: '0'}}
              ref={inputRef}
            />
            <div>
              { imagePreview && <ImagePreview {...{imagePreview, setImagePreview, fileInputRef}} setState={setReply} /> }
              {/*<ImageUploadButton {...{handleImageChange, fileInputRef}} />*/}
              <ChatSmiley setShowEmojiPicker={setShowEmojiPicker} />
            </div>
          </div>
        </label>
        {
          reply.text || reply.image ? (
            <button type="submit" style={{marginLeft: 'auto'}} disabled={loadingNewReply}>
              {
                loadingNewReply ? <ClipLoader color="salmon"/> : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '25px', color: 'salmon'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                )
              }
            </button>
          ) : null
        }
        { /*
          showEmojiPicker && (
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '35%'
              }}
            />
          )
        */}    
      </form>
    </div>
  )
}

export default Replies