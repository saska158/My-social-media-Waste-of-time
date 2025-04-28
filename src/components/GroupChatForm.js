import { useState, useEffect, useRef, useMemo } from "react"
import { addDoc, serverTimestamp, firestore, collection } from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import EmojiPicker from "emoji-picker-react"
import ChatSmiley from "../components/ChatSmiley"
import LinkPreview from "../components/LinkPreview"
import { PulseLoader } from "react-spinners"
import PopUp from "./PopUp"
import ImageUploadButton from "./ImageUploadButton"
import ImagePreview from "./ImagePreview"
import fetchLinkPreview from "../api/fetchLinkPreview"
import uploadToCloudinaryAndGetUrl from "../api/uploadToCloudinaryAndGetUrl"
import extractUrls from "../utils/extractUrls"
import { readImageAsDataURL } from "../utils/readImageAsDataURL"

const GroupChatForm = ({isPopupShown, setIsPopupShown, roomId}) => {
    const initialPost = { text: "", image: "" }

    // Context
    const { user } = useAuth()

    // State
    const [post, setPost] = useState(initialPost)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [linkData, setLinkData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Hooks that don't trigger re-renders 
    const linkPreviewRef = useRef(null) 
    const formRef = useRef(null)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    // Memoized values
    const roomRef = useMemo(() => {
      const room = roomId ? `${roomId}` : `main`
      return collection(firestore, room)
    }, [roomId])

    // Functions
    const handleTextChange = (e) => {
        setPost(prevPost => ({...prevPost, text: e.target.value}))
    }

    const createPost =  async (e) => {
      e.preventDefault()
      if (!post.text && !post.image) return
      setLoading(true)
    
      let imageUrl = ''
    
      try {
        if(post.image) {
          imageUrl = await uploadToCloudinaryAndGetUrl(post.image)
        }
    
        const newPost = {
          ...post, 
          image: imageUrl
        }
        await addDoc(roomRef, {
          creatorUid: user.uid,  
          creatorName: user.displayName, 
          photoUrl: user.photoURL || '',
          post: newPost,
          timestamp: serverTimestamp(),
          room: roomId || 'main',
          likes: {},
          comments: []
        })
        setPost(initialPost)
        setImagePreview(null)
        fileInputRef.current.value = null
      } catch(error) {
        console.error("Error while creating a post", error)
        setError(error)
      } finally {
        setLoading(false)
        setIsPopupShown(false)
      }
    }
    
    const handleEmojiClick = (emojiObject) => {
        setPost(prevPost => ({...prevPost, text: prevPost.text + emojiObject.emoji}))
    }
    
    const handleImageChange = (e) => {
      const file = e.target.files[0]
      readImageAsDataURL(
        file,
        (dataURL) => {
          setImagePreview(dataURL)
          setPost(prev => ({...prev, image: dataURL}))
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
      setPost(prev => ({...prev, text: ''}))
    }

    // Effects
    useEffect(() => {
      setLoading(true)
      const fetchData = async () => {
        try {
          const urls = extractUrls(post.text)
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
    }, [post.text]) 

    useEffect(() => {
      if(textareaRef.current) {
        textareaRef.current.focus()
      }
    }, [isPopupShown])  

    console.log("linkData", linkData)

    return (
      <PopUp setIsPopUpShown={setIsPopupShown} setShowEmojiPicker={setShowEmojiPicker}>
        <form className="group-chat-form" ref={formRef}>
          <div style={{border: '.3px solid salmon', borderRadius: '20px', padding: '1em'}}>
            <textarea
              value={post.text}
              onChange={handleTextChange}
              placeholder="let's waste time"
              className="group-chat-textarea"
              style={{minHeight: imagePreview ? '50px' : '200px'}}
              ref={textareaRef}
            />
            { imagePreview && <ImagePreview {...{imagePreview, setImagePreview, fileInputRef}} setState={setPost} /> }
          </div>
          <button 
            onClick={createPost}
            className="group-chat-form-button"
            style={{
              background: loading ? 'none' : 'rgb(253, 248, 248)',
              border: loading ? '0' : '.3px solid salmon',
            }}
            disabled={loading}
          >
            { loading ? <PulseLoader size={10} color="salmon" /> : 'post' }
          </button>  
          <div className="group-chat-form-icons">
            <ImageUploadButton {...{handleImageChange, fileInputRef}} />
            <ChatSmiley setShowEmojiPicker={setShowEmojiPicker} />
          </div>
          {
            showEmojiPicker && (
              <EmojiPicker 
                onEmojiClick={handleEmojiClick} 
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  width: '70%',
                  height: '75%'
                }}
              />
            )
          }
          {
            linkData && (
              <div style={{width: '50%', border: '2px solid red'}}>
                <LinkPreview {...{linkData, linkPreviewRef}}>
                  <button onClick={cancelLink}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} /*className="size-6"*/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </LinkPreview>
              </div>
            )
          }
        </form> 
      </PopUp>
    )
}

export default GroupChatForm