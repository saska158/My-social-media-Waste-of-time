import { useState, useEffect, useRef } from "react"
import { addDoc, serverTimestamp } from "../api/firebase"
import { useLoading } from '../contexts/loadingContext'
import { useAuth } from "../contexts/authContext"
import EmojiPicker from "emoji-picker-react"
import ChatSmiley from "../components/ChatSmiley"
import LinkPreview from "../components/LinkPreview"
import { PulseLoader } from "react-spinners"
import Button from "../components/Button"
import PopUp from "./PopUp"
import fetchLinkPreview from "../api/fetchLinkPreview"
import uploadToCloudinaryAndGetUrl from "../api/uploadToCloudinaryAndGetUrl"
import extractUrls from "../utils/extractUrls"

const GroupChatForm = ({isPopupShown, setIsPopupShown, roomRef, roomId}) => {
    const initialPost = {
        text: "",
        image: ""
    }

    // Context
    const { user } = useAuth()

    // State
    const [post, setPost] = useState(initialPost)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [linkData, setLinkData] = useState(null)
    const { loadingState, setLoadingState } = useLoading()
    const [error, setError] = useState(null)

    // Hooks that don't trigger re-renders 
    const linkPreviewRef = useRef(null) 
    const formRef = useRef(null)
    const imageInputRef = useRef(null)
    const textareaRef = useRef(null)

    // Functions
    const handleTextChange = (e) => {
        setPost(prevPost => ({...prevPost, text: e.target.value}))
    }

    const createPost =  async (e) => {
        e.preventDefault()
        if(post.text || post.image) {
          const imageFile = imageInputRef.current.files[0]
          setLoadingState(prev => ({...prev, upload: true}))
    
          let imageUrl = ''
    
          try {
            if(imageFile) {
              imageUrl = await uploadToCloudinaryAndGetUrl(imageFile)
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
              room: roomId || 'main'
            })
            setPost(initialPost)
    
          } catch(error) {
            console.error("Error while creating a post", error)
            setError(error)
          } finally {
            setLoadingState(prev => ({...prev, upload: false}))
            setIsPopupShown(false)
          }
        }
    }
    
    const handleEmojiClick = (emojiObject) => {
        setPost(prevPost => ({...prevPost, text: prevPost.text + emojiObject.emoji}))
      }
    
      const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onloadend = () => {
            console.log("result", reader.result)
            setImagePreview(reader.result)
            setPost(prevPost => ({...prevPost, image: reader.result}))
          }
          reader.readAsDataURL(file)
        }
      }

    // Effects
    useEffect(() => {
        const urls = extractUrls(post.text)
    
        if (urls && urls.length > 0) {
          fetchLinkPreview(urls[0]).then(setLinkData) 
        } else {
            setLinkData(null) 
          }
      }, [post.text]) 

    
      useEffect(() => {
        if(textareaRef.current) {
          textareaRef.current.focus()
        }
      }, [isPopupShown])  

    
    return (
        <PopUp setIsPopUpShown={setIsPopupShown} setShowEmojiPicker={setShowEmojiPicker}>
              <form 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1em',
                  height: '100%',
                  overflow: 'auto'
                }}
                ref={formRef}
              >
                <div style={{border: '.3px solid salmon', borderRadius: '20px', padding: '1em'}}>
                  <textarea
                    value={post.text}
                    onChange={handleTextChange}
                    placeholder="let's waste time"
                    style={{
                      width: '100%', 
                      minHeight: imagePreview ? '50px' : '200px', 
                      maxHeight: '300px', 
                      padding: '1em'
                    }}
                    ref={textareaRef}
                  />
                  {
                    imagePreview && (
                      <img
                        src={imagePreview}
                        alt="image-post"
                        style={{width: '500px', height: '350px', objectFit: 'cover', objectPosition: 'top'}}
                      />
                    )
                  }
                </div>
                <Button 
                  onClick={createPost}
                  style={{
                    background: loadingState.upload ? 'none' : 'rgb(253, 248, 248)',
                    alignSelf: 'flex-end',
                    border: loadingState.upload ? '0' : '.3px solid salmon',
                    color: 'salmon',
                    width: '150px',
                    borderRadius: '30px',
                    padding: '1em',
                  }}
                  disabled={loadingState.upload}
                >
                  {
                    loadingState.upload ? <PulseLoader size={10} color="salmon" /> : 'post'
                  }
                </Button>  
                <div 
                  style={{
                    display: 'flex',
                    gap: '.5em',
                    marginTop: 'auto',
                    justifyContent: 'flex-end'
                  }}
                >
                  <label
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      cursor: 'pointer',
                      width: '25px',
                      height: '25px',
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
                  <ChatSmiley setShowEmojiPicker={setShowEmojiPicker} />
                </div>
                {
                  showEmojiPicker && (
                    <div>
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
                    </div>
                  )
                }
                {
                  linkData && (
                    <LinkPreview
                      linkData={linkData}
                      linkPreviewRef={linkPreviewRef}
                    >
                      <button 
                        onClick={() => {
                          if(linkPreviewRef.current) {
                            linkPreviewRef.current.style.display = "none"
                        }}}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} /*className="size-6"*/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </LinkPreview>
                  )
                }
              </form> 
            </PopUp>
    )
}

export default GroupChatForm