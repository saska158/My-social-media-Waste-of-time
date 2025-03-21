import { useState, useEffect, useMemo, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  database, 
  ref, 
  update, 
  get, 
  onValue, 
  push, 
  firestore,
  collection, 
  query, 
  where, 
  getDoc,
  getDocs 
} from "../api/firebase"
import { useAuth } from "../contexts/authContext"
import PopUp from "../components/PopUp"
import fetchLinkPreview from "../api/fetchLinkPreview"
import extractUrls from "../utils/extractUrls"
import Comments from "./Comments"
import LinkPreview from "./LinkPreview"

const Post = ({id, creatorUid, post, roomId}) => {
  // Context 
  const { user } = useAuth()  
  
  // State
  const [profile, setProfile] = useState(null)
  const [likes, setLikes] = useState()
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)  
  const [linkData, setLinkData] = useState(null)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders
  const linkPreviewRef = useRef(null)
  const navigate = useNavigate()

  // Memoized Values (`useMemo`)
  const likesRef = useMemo(() => {
    const room = roomId ? `${roomId}` : `main`
    return ref(database, `${room}/${id}/post/likes`)
  }, [roomId])

  const commentsRef = useMemo(() => {
    const room = roomId ? `${roomId}` : `main`
    return ref(database, `${room}/${id}/post/comments`)
  }, [roomId])

  // Functions
  const handleLike = async (e) => {
    e.stopPropagation()
    if(!user) {
      //navigate('/sign-in', {
        //state: {
         // message: 'Sign in or create your account to join the conversation!',
          //from: '/' //ovde treba da bude ruta posebnih soba
        //}
      //})
      setIsJoinPopupShown(true)
    } else {
      try {
        // Fetch current likes from Firebase
        const snapshot = await get(likesRef)
        const likes = snapshot.val() || {}

        if (likes[user?.uid]) {
            await update(likesRef, { [user.uid]: null })
            console.log("Unliked")
        } else {
            await update(likesRef, { [user.uid]: { name: user.displayName } })
            console.log("Liked")
        }
    } catch (error) {
        console.error("Error updating like:", error)
    }
    }
    
  }

  // Effects
  useEffect(() => {
    const fetchProfile = async () => {
      const profilesRef = collection(firestore, "profiles")
      const q = query(profilesRef, where("uid", "==", creatorUid))
      try {
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          setProfile(querySnapshot.docs[0].data()) // Store first matching profile
        } else {
            console.log("Profile not found")
        }
      } catch (error) {
          console.error("Error fetching profile:", error)
      }
    }
  
    fetchProfile()
  }, [creatorUid])

  useEffect(() => {
    // Listen for real-time changes
    const unsubscribe = onValue(likesRef, (snapshot) => {
      setLikes(snapshot.val() || {}) // Update likes state when data changes
    })

    return () => unsubscribe()
  }, [id])

  useEffect(() => {
    const unsubscribe = onValue(commentsRef, (snapshot) => {
        const data = snapshot.val()
        setComments(data ? Object.values(data) : []) 
    })

    return () => unsubscribe()
  }, [id])

  /* effect to detect and fetch preview when user types a URL */
  useEffect(() => {
    const urls = extractUrls(post.text)

    if (urls && urls.length > 0) {
        fetchLinkPreview(urls[0]).then(setLinkData) // We take the first URL from the input
    } else {
        setLinkData(null) // Clear preview if no URL is detected
    }
  }, [post.text]) 


  const isLiked = !!(likes && likes[user?.uid])
  const likesArray = Object.values(likes || {})

  return (
    <div 
      key={id}
      style={{
        background: 'white',
        border: '.5px solid rgb(247, 198, 193)',
        borderRadius: '10px',
        width: '70%',
        margin: '1em',
        padding: '1em'
      }}
    >
      <Link to={creatorUid ? `/user/${creatorUid}` : '/my-profile'}>
        <div style={{display: 'flex', padding: '.5em', cursor: 'pointer'}}>
          {
            profile?.photoURL ? (
              <img 
                //src={photoUrl}
                src={profile.photoURL} 
                alt="profile" 
                style={{
                  width: '30px', 
                  height: '30px',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  display: 'inline',
                  borderRadius: '50%'
                }}
              />
            ) : null
          }
          <div>
            {/*<p><strong>{creatorName}</strong></p>*/}
            <p><strong>{profile?.displayName}</strong></p>
          </div>
        </div>
      </Link>
      {
        linkData ? (
          <LinkPreview
            linkData={linkData}
            linkPreviewRef={linkPreviewRef}
          />
        ) : (
          <div>
            <p style={{fontSize: '.8rem', padding: '0 .5em'}}>{post?.text}</p>
            {
              post.image && (
                <img
                  src={post.image}
                  alt="post-image"
                />
              )
            }
          </div>
        )
      }
      <div 
        style={{
          fontSize: '.7rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '.5em',
          color: 'salmon'
        }}
      >
        <span>
          {
            likesArray.length === 0 ? `0 likes` :
            likesArray.length === 1 ? `${likesArray[0]?.name} likes` :
            `${likesArray[0].name} and ${likesArray.length - 1} others`
          }
        </span>
        <span>{comments.length} comments</span>
      </div>
      <div>
        <div 
          style={{
            display: 'flex',
            gap: '2em', 
            borderTop: '.5px solid rgb(247, 198, 193)', 
            fontSize: '.7rem',
            color: 'rgb(243, 85, 68)',
            padding: '.5em',
          }}
        >
          <button 
            style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '.5em',
              color: 'salmon'
            }}
            onClick={handleLike}
          >
            {
              isLiked ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" style={{width: '20px'}}>
                  <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                </svg>
              )
            }
            like
          </button>
          <button 
            style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '.5em',
              color: 'salmon'
            }}
            onClick={(e) => {
              e.stopPropagation()
              if(!user) {
                //navigate('/sign-in', {
                  //state: {
                    //message: 'Sign in or create your account to join the conversation!',
                    //from: '/' //ovde treba da bude ruta posebnih soba
                  //}
                //})
                setIsJoinPopupShown(true)
              } else {
                  setShowComments(!showComments)
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            comment
          </button>
        </div>
        {
          showComments && (
            <Comments 
              comments={comments}
              roomId={roomId}
              id={id}
            />
          )
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

export default Post