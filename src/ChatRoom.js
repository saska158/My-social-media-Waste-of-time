import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { database, ref, push, onValue, /*firestore, doc, updateDoc, arrayUnion */} from "./firebase"
import { useAuth } from './authContext'
//import MessagesList from "./MessagesList"
import Input from "./Input"
import Button from "./Button"
import Post from "./Post"

const ChatRoom = () => {
    //const messages = useOutletContext(
    const initialPost = {
      text: ""
    }
    const [post, setPost] = useState(initialPost)
    const [posts, setPosts] = useState([])

    const [isPopupShown, setIsPopupShown] = useState(false)

    const { user } = useAuth()
    //console.log("Imamo usera, chatlay:", user)
    const formRef = useRef(null)

    const navigate = useNavigate()

    const { roomId } = useParams()

    const roomRef = useMemo(() => {
      const room = roomId ? `${roomId}` : `main`
      return ref(database, room)
    }, [roomId])

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
            message: 'You need to sign up to send a message.',
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
        }
      }
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }, [])


    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: "column",
            height: '550px',
            width: '90%'
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
              margin: '.7em'
            }}
            onClick={(e) => {
              e.stopPropagation()
              setIsPopupShown(true)
            }}
          >
            new post
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
                  background: 'rgba(0, 0, 0, 0.5)'
                }}
              >
                <form 
                  style={{
                    padding: '.5em',
                    background: 'white',
                    width: '50%',
                    height: '500px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '20px'
                  }}
                  ref={formRef}
                >
                  <Input
                    type="text"
                    value={post.text}
                    placeholder="let's waste time"
                    onChange={handleTextChange}
                  />
                  <Button onClick={createPost}>post</Button>  
                </form> 
              </div>
            )
          }
         {/* <MessagesList posts={posts} roomId={roomId} />*/}

          <div style={{
            background: 'rgb(253, 239, 237)',
            display: 'flex',
            flexDirection: "column-reverse",
            flex: '1',
            /*overflowY: 'auto',
            height: '500px'*/
          }}>
            {
              posts && posts.map(postItem => <Post
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