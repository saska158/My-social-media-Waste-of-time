import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../contexts/authContext"
import {    
  firestore,
  doc,
  getDoc, 
  updateDoc,
  onSnapshot,
  deleteField
} from "../../api/firebase"
import Comments from "./Comments"
import JoinPopUp from "../JoinPopUp"

const PostActions = ({roomId, id}) => {
  // Context
  const { user } = useAuth()

  // State
  const [likes, setLikes] = useState()  
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false) 
  const [isJoinPopupShown, setIsJoinPopupShown] = useState(false) 

  // Memoized Values (`useMemo`)
  const postRef = useMemo(() => {
    const room = roomId ? `${roomId}` : `main`
    return doc(firestore, room, id)
  }, [roomId, id])

  // Functions
  const handleLike = async (e) => {
    e.stopPropagation()
    if(!user) {
      setIsJoinPopupShown(true)
    } else {
       try {
          const snapshot = await getDoc(postRef)
          const likes = snapshot.data().likes || {}

          if (likes[user?.uid]) {
            await updateDoc(postRef, {[`likes.${user.uid}`]: deleteField()})
            console.log("Unliked")
          } else {
            await updateDoc(postRef, {[`likes.${user.uid}`]: {name: user.displayName}})
            console.log("Liked")
          }
       } catch (error) {
          console.error("Error updating like:", error)
       }
    } 
  }

  // Effects
  useEffect(() => {
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if(!snapshot.empty) {
        const likes = snapshot.data().likes
          setLikes(likes)
      }
    })

    return () => unsubscribe()
  }, [id, postRef])

  useEffect(() => {
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if(!snapshot.empty) {
        const comments = snapshot.data().comments
        console.log('snap com', comments)
        setComments(comments)
      }
    })

    return () => unsubscribe()
  }, [id, postRef])

  const isLiked = !!(likes && likes[user?.uid])
  const likesArray = Object.values(likes || {})

  return (
    <div>
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
            `${likesArray[0].name} and ${likesArray.length - 1} ${likesArray.length - 1 === 1 ? 'other' : 'others'}`
          }
        </span>
        <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
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
        isJoinPopupShown && <JoinPopUp setIsPopUpShown={setIsJoinPopupShown} />
      }
    </div>
  )
}

export default PostActions