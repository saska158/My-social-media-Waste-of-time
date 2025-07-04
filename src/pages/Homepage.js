import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from '../contexts/authContext'
import { firestore, collection } from "../api/firebase"
import Post from "../components/post/Post"
import JoinPopUp from "../components/JoinPopUp"
import PostForm from "../components/post/PostForm"
import PopUp from "../components/PopUp"
import PostSkeleton from "../components/skeletons/PostSkeleton"
import useFirestoreBatch from "../hooks/useFirestoreBatch"
import InfiniteScroll from "react-infinite-scroll-component"
import ErrorMessage from "../components/errors/ErrorMessage"
import { ClipLoader } from "react-spinners"

const Homepage = () => {
  // Context
  const { user } = useAuth()

  // State
  const [isPopupShown, setIsPopupShown] = useState(false)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)
 
  const { roomId } = useParams()

  // Memoized values 
  const room = useMemo(() => {
    return roomId ? `${roomId}` : `watching`
  }, [roomId])

  const roomRef = useMemo(() => {
    const room = roomId ? `${roomId}` : `watching`
    return collection(firestore, room)
  }, [roomId])


  // Custom hooks
  const { data: posts, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(roomRef, 7)

  // Functions
  const handleNewPost = (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      setIsPopupShown(true)
    }
  }

  if(error) {
    return <ErrorMessage message={error} isFatal={true} onRetry={refetch} />
  }
  
  return (
    <div className="group-chat-container">
      { 
        isPopupShown && (
          <PopUp setIsPopUpShown={setIsPopupShown}>
            <PostForm 
              firestoreRef={roomRef} 
              placeholder={`Hey ${user?.displayName} — what do you waste time on?`}
              type="create-post" 
              setIsPopupShown={setIsPopupShown} 
            />
          </PopUp>
        ) 
      }
      <div className="posts-container">
        <div 
          style={{
            width: '100%', 
            padding: '.5em 1em',
            background: "#eaf4f0",
          }}
        >
          <button 
            onClick={handleNewPost} 
            className="show-popup-btn"
            style={{padding: '.5em 0 2.5em', width: '100%'}}
          >
            { 
              user && (
                <img 
                  src={user.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
                  alt="user-profile-image" 
                  className="user-img user-img-medium"
                />
              ) 
            }
            Hey <strong style={{margin: '-.3em', fontWeight: '800'}}>
              {user?.displayName.toLowerCase()}
            </strong> — what do you waste time on? 🖍️
          </button>
        </div>
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ClipLoader color="#4b896f" />}
          scrollThreshold={0.9}
        >
          {
            loading ? <PostSkeleton /> : (
              posts.length > 0 ? posts.map(post=> (
                <Post
                  key={post.id}
                  post={post}
                  room={room}
                />
              )) : (
                <div>No posts in this room yet.</div>
              )
            )
          }    
        </InfiniteScroll>
      </div>
      { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default Homepage






