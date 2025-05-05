import { useState, useEffect, memo, useMemo } from "react"
import { firestore, collection } from "../../api/firebase"
import fetchProfile from "../../api/fetchProfile"
import PostHeader from "./PostHeader"
import PostContent from "./PostContent"
import PostActions from "./PostActions"
import PopUp from "../PopUp"
import Comments from "./Comments"

const Post = ({post, roomId, room,  style}) => {
  const { id: postId, creatorUid, content, timestamp } = post

  // State
  const [profile, setProfile] = useState(null)
  const [showComments, setShowComments] = useState(false) 
  const [error, setError] = useState(null)

  const commentsRef = useMemo(() => {
    return collection(firestore, room, postId, 'comments')
  }, [room])

  // Effects
  useEffect(() => {
    const getProfile = async () => {
      try {
        await fetchProfile(creatorUid, setProfile)
      } catch(error) {
        console.error("Error fetching profile:", error)
        setError(error)
      }
    }

    getProfile()
  }, [creatorUid])

  return (
    <div key={postId} className="post-container" style={style}>
      <PostHeader {...{creatorUid, timestamp, profile}} />
      <PostContent {...{content}} />
      <PostActions {...{roomId, room, postId, showComments, setShowComments}} />

      { 
        showComments && (
          <PopUp setIsPopUpShown={setShowComments} style={{paddingTop: '2em'}}> 
            <Comments {...{room, postId}} firestoreRef={commentsRef} type="comments" />
          </PopUp>
        ) 
      }
    </div>
  )
}

export default memo(Post)