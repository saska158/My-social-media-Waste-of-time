import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from '../contexts/authContext'
import { firestore, collection } from "../api/firebase"
import Post from "../components/post/Post"
import JoinPopUp from "../components/JoinPopUp"
import PostForm from "../components/PostForm"
import PopUp from "../components/PopUp"
import PostSkeleton from "../components/skeletons/PostSkeleton"
import useFirestoreBatch from "../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import InfiniteScroll from "react-infinite-scroll-component"
import ErrorMessage from "../components/errors/ErrorMessage"

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
      {/*<button className="new-post-button" onClick={handleNewPost}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
        <span>new post</span>
      </button>*/}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5em', width: '100%', paddingTop: '1em'}}>
        { 
          user && (
            <img 
              src={user.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
              alt="user-profile-image" 
              className="post-header-profile-image"
            />
          ) 
        }
        <button 
          onClick={handleNewPost} 
          className="show-popup-btn"
        >
          What's on your mind {user?.displayName}? 
        </button>
      </div>
      { 
        isPopupShown && (
          <PopUp setIsPopUpShown={setIsPopupShown} /*setShowEmojiPicker={setShowEmojiPicker}*/>
            <PostForm firestoreRef={roomRef} placeholder="let's waste time..." type="create-post" setIsPopupShown={setIsPopupShown}/>
          </PopUp>
        ) 
      }
      <div className="posts-container" id="scrollableDiv">
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ClipLoader color="#f29bbe" />}
          scrollThreshold={0.9}
          scrollableTarget="scrollableDiv"
          style={{width: '500px'}}
        >
          <div className="posts">
            {
              loading ? <PostSkeleton /> : (
                posts.length > 0 ? posts.map(post=> (
                  <Post
                    key={post.id}
                    post={post}
                    room={room}
                  />
                )) : (
                  <div>No posts in this room yet</div>
                )
              )
            }    
          </div> 
        </InfiniteScroll>
      </div>
      { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default Homepage






