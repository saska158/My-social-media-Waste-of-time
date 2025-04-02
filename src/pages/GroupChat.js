import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react"
import { useParams } from "react-router-dom"
import { firestore, collection } from "../api/firebase"
import { useAuth } from '../contexts/authContext'
import Post from "../components/post/Post"
import JoinPopUp from "../components/JoinPopUp"
import GroupChatForm from "../components/GroupChatForm"
import usePosts from "../hooks/usePosts"
import useInfiniteScroll from "../hooks/useInfiniteScroll"

const GroupChat = () => {
  // Context
  const { user } = useAuth()

  // State
  //const [posts, setPosts] = useState([])
  const [isPopupShown, setIsPopupShown] = useState(false)
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false)

  // Hooks that don't trigger re-renders  
  const { roomId } = useParams()
  const postsRef = useRef(null)

  // Memoized Values (`useMemo`)
  const roomRef = useMemo(() => {
    const room = roomId ? `${roomId}` : `main`
    return collection(firestore, room)
  }, [roomId])

  // Custom hooks
  const { posts, fetchMorePosts, hasMore, loadingState } = usePosts(postsRef)
  useInfiniteScroll(fetchMorePosts, hasMore, postsRef)

  // Functions
  const handleNewPost = (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
      setIsPopupShown(true)
    }
  }

  // Effects

 /* useEffect(() => {
    const postsEl = postsRef.current
    postsEl.addEventListener("scroll", () => {console.log(postsEl.scrollTop)})
  }, [])
*/
  /*useLayoutEffect(() => {
    const postsEl = postsRef.current
    const timeoutId = setTimeout(() => {
      if(postsEl) {
        postsEl.scrollTop = postsEl.scrollTop - postsEl.scrollHeight
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [posts])*/

  return (
    <div className="group-chat-container">
      <button className="new-post-button" onClick={handleNewPost}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{width: '20px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
        <span>new post</span>
      </button>
        { isPopupShown && <GroupChatForm {...{isPopupShown, setIsPopupShown, roomRef, roomId}}/> }
        <div className="posts-container" ref={postsRef}>
          {
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
          }
        </div>
        { isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} /> }
    </div>
  )
}

export default GroupChat

