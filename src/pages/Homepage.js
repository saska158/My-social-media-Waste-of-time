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
    return roomId ? `${roomId}` : `main`
  }, [roomId])

  const roomRef = useMemo(() => {
    const room = roomId ? `${roomId}` : `main`
    return collection(firestore, room)
  }, [roomId])


  // Custom hooks
  const { data: posts, loading, error, fetchMore, hasMore, refetch } = useFirestoreBatch(roomRef, 5)

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
              placeholder="let's waste time..." 
              type="create-post" 
              setIsPopupShown={setIsPopupShown} 
            />
          </PopUp>
        ) 
      }
      <div className="posts-container" id="scrollableDiv">
        <div 
          style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '1em',
            width: '100%', 
            padding: '0 .7em',
            background: "#eaf4f0",
          }}
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
          <button 
            onClick={handleNewPost} 
            className="show-popup-btn"
            style={{padding: '1.5em 0', width: '90%'}}
          >
            Hey <span style={{fontWeight: '700'}}>{user?.displayName}</span> - what you waste time on?
          </button>
        </div>
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ClipLoader color="#4b896f" />}
          scrollThreshold={0.9}
          scrollableTarget="scrollableDiv"
          //style={{width: '500px'}}
          //style={{width: '580px'}}
        >
          {/*<div className="posts">*/}
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
          {/*</div> */}
        </InfiniteScroll>
      </div>
      { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default Homepage






