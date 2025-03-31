import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { database, ref, onValue } from "../api/firebase"
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
    return ref(database, room)
  }, [roomId])

  // Custom hooks
  const { posts, fetchMorePosts, hasMore, loadingState } = usePosts(roomRef)
  useInfiniteScroll(fetchMorePosts, hasMore, postsRef)

  // Effects
  /* postavljamo slushac poruka u realtime-u */
 /* useEffect(() => {
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
  }, [roomRef])*/


  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: "column",
      }}
    >
      <button
        style={{
          border: '.3px solid salmon',
          color: 'salmon',
          background: 'rgb(253, 248, 248)',
          width: '150px',
          borderRadius: '30px',
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
            <GroupChatForm
              isPopupShown={isPopupShown}
              setIsPopupShown={setIsPopupShown}
              roomRef={roomRef}
              roomId={roomId}
            />
          )
        }
        <div 
          style={{
            background: 'rgb(253, 239, 237)',
            display: 'flex',
            flexDirection: "column-reverse",
            alignItems: 'center',
            //flex: '1',
            height: '500px',
            overflowY: 'auto',
            //border: '1px solid red'
          }}
          ref={postsRef}
        >
          {
            posts.length > 0 && posts.map(postItem => (
              <Post
                key={postItem.id}
                id={postItem.id}
                creatorUid={postItem.creatorUid}
                post={postItem.post}
                roomId={roomId}
              />
            ))
          }
        </div>
        {
          isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} />
        }
    </div>
  )
}

export default GroupChat

