import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/authContext" 
import extractUrls from "../utils/extractUrls"
import fetchLinkPreview from "../api/fetchLinkPreview"
import { readImageAsDataURL } from "../utils/readImageAsDataURL"
import sendPostToFirestore from "../api/sendPostToFirestore"
import ImagePreview from "./ImagePreview"
import LinkPreview from "./LinkPreview"
import ImageUploadButton from "./ImageUploadButton"
import ChatSmiley from "./ChatSmiley"
import EmojiPicker from "emoji-picker-react"
import Textarea from "./Textarea"
import { ClipLoader } from "react-spinners"


const PostForm = ({dataArray=null, firestoreRef, placeholder, type, setIsPopupShown=()=>{}, style=null}) => {
  const initialData = {
    text: '',
    image: ''
  }  
  // Context
  const { user } = useAuth()
  
  // State
  const [data, setData] = useState(initialData)
  const [imagePreview, setImagePreview] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false) 
  const [linkData, setLinkData] = useState(null)
  const [linkFromText, setLinkFromText] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders 
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null) 
  const formRef = useRef(null)

  // Functions
  const handleDataChange = (e) => {
    //const urls = extractUrls(e.target.value)
    //f(urls && urls.length > 0) {
      //setLinkFromText(urls[0])
    //}
    setData(prev => ({...prev, text: e.target.value}))
  }

  const handleEmojiClick = (emojiObject) => {
    setData(prev => ({...prev, text: prev.text + emojiObject.emoji}))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    readImageAsDataURL(
      file,
      (dataURL) => {
        setImagePreview(dataURL)
        setData(prev => ({...prev, image: dataURL}))
      },
      (error) => {
        setError(error)
      }
    )
  }

  const cancelLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLinkData(null)
    setLinkFromText(null)
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    if (!data.text && !data.image) return
    setLoading(true)
    try {
      await sendPostToFirestore(user, data, firestoreRef)
      setData(initialData)
      setImagePreview(null)
      setShowEmojiPicker(false)
      setLinkData(null)
      setLinkFromText(null)
      fileInputRef.current.value = null
      setIsPopupShown(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  // Effects
  /*useEffect(() => {
    if(textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [dataArray])//proveri sto uopste ovo*/

  useEffect(() => {
    if(!data.text) return
    //if (!linkFromText) return
    setLoading(true)
    const fetchData = async () => {
      try {
        const urls = extractUrls(data.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0]) 
          //const linkDetails = await fetchLinkPreview(linkFromText) 
          setLinkData(linkDetails)                            
        }
      } catch(error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [data.text/*linkFromText*/])


  return (
    <form onSubmit={handleOnSubmit} ref={formRef} className={`${type}-form`} style={style}>
      <label className={`${type}-main-label`}>
        {
          linkData && (
            <LinkPreview {...{linkData /*linkFromText*/}} content={data} style={{display: 'flex', alignItems: 'flex-start'}} imgStyle={{width: '30%'}}>
              <button onClick={cancelLink}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '15px'}} /*className="size-6"*/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </LinkPreview>
          )
        }
        <div 
          style={{
            display: 'flex', 
            alignItems: type === 'create-post' ? 'flex-start' : 'center', 
            flexDirection: type === 'create-post' ? 'column' : 'row',
            gap: '1em',
          }}
        >
          <div style={{display: 'flex', gap: '.3em', }}>
            <img src={user.photoURL} alt="profile-img" className={`${type}-profile-image`} />
            {
              type === 'create-post' && <span>{user.displayName}</span>
            }
          </div>
          <Textarea
            value={data.text}
            onChange={handleDataChange}
            placeholder={placeholder}
            textareaRef={textareaRef}
            type={type}
          />
          <div style={{display: 'flex', alignItems: 'center'}}>
            { imagePreview && <ImagePreview {...{imagePreview, setImagePreview, fileInputRef}} setState={setData} /> }
            <ImageUploadButton {...{handleImageChange, fileInputRef}} />
            <ChatSmiley setShowEmojiPicker={setShowEmojiPicker} />
          </div>
        </div>
      </label>
      {
        data.text || data.image ? (
          <button type="submit" className={`${type}-form-btn`} disabled={loading}>
            {
              loading ? (
                <ClipLoader color="salmon"/>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '30px', color: 'salmon'}}>
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
              position: 'fixed',
              bottom: '10%',
              left: '10%',
              width: '30%',
            }}
          />
        )
      }
    </form>
  )    
}

export default PostForm

