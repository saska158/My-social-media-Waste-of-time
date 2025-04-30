import { useState, useEffect, useRef } from "react"
import { firestore, collection, addDoc, serverTimestamp } from "../../api/firebase"
import { useAuth } from "../../contexts/authContext"
import EmojiPicker from "emoji-picker-react"
import ChatSmiley from "../ChatSmiley"
import ImagePreview from "../ImagePreview"
import ImageUploadButton from "../ImageUploadButton"
import LinkPreview from "../LinkPreview"
import { ClipLoader } from "react-spinners"
import uploadToCloudinaryAndGetUrl from "../../api/uploadToCloudinaryAndGetUrl"
import { readImageAsDataURL } from "../../utils/readImageAsDataURL"
import extractUrls from "../../utils/extractUrls"
import fetchLinkPreview from "../../api/fetchLinkPreview"


const CommentsForm = ({room, id, comments}) => {
  const initialComment = {text: '', image: ''}

  // Context
  const {user} = useAuth()

  // State
  const [comment, setComment] = useState(initialComment)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [loadingNewComment, setLoadingNewComment] = useState(false)
  const [linkData, setLinkData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders 
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const linkPreviewRef = useRef(null)  

  // Functions
  const handleComment = (e) => {
    setComment(prevComment => ({...prevComment, text: e.target.value}))
  }
  
  const handleEmojiClick = (emojiObject) => {
    setComment(prevComment => ({...prevComment, text: prevComment.text + emojiObject.emoji}))
  }
  
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    readImageAsDataURL(
      file,
      (dataURL) => {
        setImagePreview(dataURL)
        setComment(prev => ({...prev, image: dataURL}))
      },
      (error) => {
        setError(error)
      }
    )
  }
  
  const addComment = async (e) => {
    e.preventDefault()
    if(!comment.text && ! comment.image) return
    const commentsRef = collection(firestore, room, id, "comments")
  
    if(comment.text || comment.image) {
      const imageFile = fileInputRef.current.files[0]
      let imageUrl = ''
      setLoadingNewComment(true)

      try {
        if(imageFile) {
          imageUrl = await uploadToCloudinaryAndGetUrl(imageFile)
        }
  
        const newComment = {
          ...comment,
          image: imageUrl
        }
  
        const newCommentData = {
          userId: user.uid,
          name: user.displayName,
          photoURL: user.photoURL,
          content: newComment,
          timestamp: serverTimestamp()
        }
        await addDoc(commentsRef, newCommentData)
        setComment(initialComment)  
        setImagePreview(null)
        setLinkData(null)
        fileInputRef.current.value = null
      } catch(error) {
        console.error("Error sending comment", error)
        setError(error)
      } finally {
        setLoadingNewComment(false)
      }
    }
  }

  const cancelLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLinkData(null)
    //setComment(prev => ({...prev, text: ''}))
  }
  
  // Effects
  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }
  }, [comments])

  useEffect(() => {
    if(!comment.text) return
    setLoading(true)
    const fetchData = async () => {
      try {
        const urls = extractUrls(comment.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0]) //mislim da je ovo primer kako sam resila
          setLinkData(linkDetails)                            // pomocu async/await tamo gde imam .then() 
        }
      } catch(error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [comment.text])

  return (
    <form onSubmit={addComment} className="comments-form">
      <label className="comments-main-label">
        {
          linkData && (
            <LinkPreview {...{linkData, linkPreviewRef}} style={{display: 'flex', alignItems: 'flex-start'}} imgStyle={{width: '30%'}}>
              <button onClick={cancelLink}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '15px'}} /*className="size-6"*/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </LinkPreview>
          )
        }    
        <div style={{display: 'flex'}}>
          <input
            type="text"
            placeholder="Add a comment"
            value={comment.text}
            onChange={handleComment}
            style={{border: '0'}}
            ref={inputRef}
          />
          <div>
            { imagePreview && <ImagePreview {...{imagePreview, setImagePreview, fileInputRef}} setState={setComment} /> }
            <ImageUploadButton {...{handleImageChange, fileInputRef}} />
            <ChatSmiley setShowEmojiPicker={setShowEmojiPicker} />
          </div>
          </div>
        </label>
        {
          comment.text || comment.image ? (
            <button type="submit" style={{marginLeft: 'auto'}} disabled={loadingNewComment}>
              {
                loadingNewComment ? <ClipLoader color="salmon"/> : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '25px', color: 'salmon'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                )
              }
            </button>
          ) : null
        }
        { 
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
        }    
      </form>
  )
}

export default CommentsForm