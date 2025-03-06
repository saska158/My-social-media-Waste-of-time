import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { database, ref, push, onValue, /*firestore, doc, updateDoc, arrayUnion */} from "./firebase"
import { useAuth } from './authContext'
//import MessagesList from "./MessagesList"
import Input from "./Input"
import Button from "./Button"
import Post from "./Post"
import PopUp from "./PopUp"
import fetchLinkPreview from "./api/fetchLinkPreview"
import extractUrls from "./utils/extractUrls"

const ChatRoom = () => {
    //const messages = useOutletContext(
    const initialPost = {
      text: ""
    }
    const [post, setPost] = useState(initialPost)
    const [posts, setPosts] = useState([])
    const [videoData, setVideoData] = useState(null)

    const [isPopupShown, setIsPopupShown] = useState(false)
    const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)

    const { user } = useAuth()
    //console.log("Imamo usera, chatlay:", user)
    const formRef = useRef(null)

    const linkPreviewRef = useRef(null)

    const navigate = useNavigate()

    const { roomId } = useParams()

    const roomRef = useMemo(() => {
      const room = roomId ? `${roomId}` : `main`
      return ref(database, room)
    }, [roomId])

    // Effect to detect and fetch preview when user types a URL
    useEffect(() => {
      const urls = extractUrls(post.text)

      if (urls && urls.length > 0) {
          fetchLinkPreview(urls[0]).then(setVideoData) // We take the first URL from the input
      } else {
          setVideoData(null) // Clear preview if no URL is detected
      }
    }, [post.text]) 

    const handleTextChange = (e) => {
      setPost(prevPost => ({...prevPost, text: e.target.value}))
    }

    //OVDE PORED TOGA STO PORUKU SALJEMO U REALTIMEDATABASE, TREBALO BI I U FIRESTORE U DOKUMENT
    //NPR TE OSOBE POD PROPERTIJEM MOJE PORUKE/MOJI POSTOVI
    //DA BISMO U PROFILU TE OSOBE PRIKAZALI NJENE POSTOVE
    const createPost =  async (e) => {
      e.preventDefault()
      if(!user) {
        navigate('/sign-in', {
          state: {
            message: 'Sign in or create your account to join the conversation!',
            from: '/' //ovde treba da bude ruta posebnih soba, ne znam kako
          }
        })
        setPost(initialPost)
        return
      }
      //slanje u realtime database
      push(roomRef, {
        creatorUid: user.uid,  
        creatorName: user.displayName, 
        photoUrl: user.photoURL || '',
        post: post,
        room: roomId || 'main'
      })
      //slanje u firestore/profiles/posts
      //const profileRef = doc(firestore, "profiles", user.uid)
      //await updateDoc(profileRef, {posts: arrayUnion({creatorUid: user.uid, post: post, creatorName: user.displayName, photoUrl: user.photoURL || ''})})
      setPost(initialPost)
      setIsPopupShown(false)
    }

    /* postavljamo slushac poruka u realtime-u */
    useEffect(() => {
      const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val()
        if(data) {
          const postsArray = Object.keys(data).map((key) => ({id: key, ...data[key]}))
          setPosts(postsArray)
        } else {
          setPosts([])
        }
      })
  
      return () => unsubscribe()
    }, [roomRef])

    useEffect(() => {
      const handleClickOutside = (e) => {
        if(formRef.current && !formRef.current.contains(e.target)) {
          setIsPopupShown(false)
          setPost(initialPost)
        }
      }
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }, [])


    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: "column",
            //height: '550px',
            height: '550px',
            overflow: 'auto',
            //alignItems: 'center'
            //width: '90%'
        }}>
          {/*<button
            style={{
              background: 'rgb(245, 99, 83)',
              color: 'white',
              padding: '.6em .8em',
              border: '0',
              borderRadius: '20px',
              width: '80px'
           }}
          >
            New post
          </button>  */}
          <button
            style={{
              border: '.3px solid grey',
              background: 'rgb(241, 241, 241)',
              width: '70%',
              borderRadius: '20px',
              padding: '1em 1.5em',
              margin: '.7em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5em'
            }}
            onClick={(e) => {
              e.stopPropagation()
              if(!user) {
                setIsJoinPopupShown(true)
              } else {
                setIsPopupShown(true)
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            <span>new post</span>
          </button>
          {
            isPopupShown && (
              <div
                style={{
                  position: 'fixed',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  background: 'rgba(238, 171, 163, .5)'
                }}
              >
                <form 
                  style={{
                    background: 'white',
                    width: '50%',
                    height: '500px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '1em',
                    borderRadius: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1em'
                  }}
                  ref={formRef}
                >
                  {/*<Input
                    type="text"
                    value={post.text}
                    placeholder="let's waste time"
                    onChange={handleTextChange}
                  />*/}
                  <textarea
                    value={post.text}
                    onChange={handleTextChange}
                    placeholder="let's waste time"
                    rows="4"
                    style={{width: '100%', padding: '1em'}}
                  />
                  <Button 
                    onClick={createPost}
                    style={{
                      background: 'salmon',
                      color: 'white',
                      borderRadius: '20px',
                      padding: '.5em 1em',
                      alignSelf: 'flex-end'
                    }}
                  >
                    post
                  </Button>  
                     {/* Preview section: Show the link preview if available */}
                  {videoData && (
                <div 
                  style={{ 
                    marginTop: "10px", 
                    border: "1px solid #ccc", 
                    padding: "10px" 
                  }}
                  ref={linkPreviewRef}
                >
                    <button onClick={() => {
                      if(linkPreviewRef.current) {
                        linkPreviewRef.current.style.display = "none"
                      }
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} /*className="size-6"*/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <a href={videoData.url} target="_blank" rel="noopener noreferrer">
                        <img
                            src={videoData.image}
                            alt={videoData.title}
                            style={{ width: "70%", marginRight: "10px" }}
                        />
                        <div>
                            <p style={{textTransform: 'initial'}}>{videoData.title}</p>
                            {/*<p>{videoData.description}</p>*/}
                        </div>
                    </a>
                </div>
            )}
                </form> 

              </div>
            )
          }
         {/* <MessagesList posts={posts} roomId={roomId} />*/}

          <div style={{
            background: 'rgb(253, 239, 237)',
            display: 'flex',
            flexDirection: "column-reverse",
            //alignItems: 'center',
            flex: '1',
            //overflowY: 'auto',
            //height: '100vh'
          }}>
            {
              posts.length > 0 && posts.map(postItem => <Post
                                              key={postItem.id}
                                              id={postItem.id}
                                              creatorUid={postItem.creatorUid}
                                              photoUrl={postItem.photoUrl}
                                              creatorName={postItem.creatorName}
                                              post={postItem.post}
                                              //setPost={setPost}
                                              roomId={roomId}
                                            />)
            }
          </div>

          {
            isJoinPopupShown && (
              <PopUp setIsPopUpShown={setIsJoinPopupShown}>
                <h1>Razgovori</h1>
                <p>Sign in or create your account to join the conversation!</p>
                <Link to="/sign-up">
                  <button 
                    style={{
                      fontSize: '1rem', 
                      background: 'salmon', 
                      padding: '.7em 1.2em', 
                      borderRadius: '10px',
                      color: 'white'
                    }}
                  >
                    Create an account
                  </button>
                </Link>
                <Link to="/sign-in">
                  <button 
                    style={{
                      fontSize: '1rem',
                      padding: '.7em 1.2em', 
                      borderRadius: '10px',
                      background: 'rgba(238, 171, 163, .5)'
                    }}
                  >
                    Sign in
                  </button>
                </Link>
              </PopUp>
            )
          }
        </div>
    )
}

export default ChatRoom

/*
            <form style={{display: 'flex', padding: '.5em'}}>
            <Input
              type="text"
              value={message}
              placeholder="let's waste time"
              onChange={handleInput}
            />
            <Button onClick={sendMessage}>post</Button>
          </form>  
*/