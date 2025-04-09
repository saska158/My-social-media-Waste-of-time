import { useState, useEffect, useMemo, useRef } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from '../contexts/authContext'
import { firestore, collection } from "../api/firebase"
import Post from "../components/post/Post"
import JoinPopUp from "../components/JoinPopUp"
import GroupChatForm from "../components/GroupChatForm"
import PostSkeleton from "../components/skeletons/PostSkeleton"
import useFirestoreBatch from "../hooks/useFirestoreBatch"
import { ClipLoader } from "react-spinners"
import InfiniteScroll from "react-infinite-scroll-component"

const GroupChat = () => {
  // Context
  const { user } = useAuth()

  // State
  const [isPopupShown, setIsPopupShown] = useState(false)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)

  // Hooks that don't trigger re-renders  
  const { roomId } = useParams()
  const postsRef = useRef(null)

  // Memoized values 
  const room = useMemo(() => roomId ? `${roomId}` : `main`, [roomId])
  const roomRef = useMemo(() => collection(firestore, room), [room])

  // Custom hooks
  const { data: posts, loading, fetchMore, hasMore } = useFirestoreBatch(roomRef)

  // Functions
  const handleNewPost = (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      setIsPopupShown(true)
    }
  }
  
  return (
    <div className="group-chat-container">
      <button className="new-post-button" onClick={handleNewPost}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
        <span>new post</span>
      </button>
        { isPopupShown && <GroupChatForm {...{isPopupShown, setIsPopupShown, roomId}}/> }
        <div className="posts-container" ref={postsRef} id="scrollableDiv">
           <InfiniteScroll
             dataLength={posts.length}
             next={fetchMore}
             hasMore={hasMore}
             loader={<ClipLoader color="salmon" />}
             scrollThreshold={0.9}
             endMessage={
              <p style={{ textAlign: 'center' }}>
               Yay! You have seen it all
              </p>
             }
             scrollableTarget="scrollableDiv"
             style={{width: '100%'}}
           >
           <div className="posts">
            {
              loading ? <PostSkeleton /> : (
                posts.length > 0 ? posts.map(postItem => ( 
                  <Post
                    key={postItem.id}
                    id={postItem.id}
                    creatorUid={postItem.creatorUid}
                    post={postItem.post}
                    roomId={roomId}
                  />
                )) : (
                  <div>There's no posts in this room yet</div>
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

export default GroupChat






