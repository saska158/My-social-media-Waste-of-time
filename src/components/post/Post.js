import { useState, useEffect, memo, useMemo } from "react"
import { firestore, collection, doc } from "../../api/firebase"
import fetchProfile from "../../api/fetchProfile"
import FirestoreItemHeader from "./FirestoreItemHeader"
import FirestoreItemContent from "./FirestoreItemContent"
import FirestoreItemActions from "./FirestoreItemActions"
import PopUp from "../PopUp"
import Comments from "./Comments"

const Post = ({post, room,  style}) => {
  const { id: postId, creatorUid, content, timestamp } = post

  // State
  const [profile, setProfile] = useState(null)
  const [showComments, setShowComments] = useState(false) 
  const [error, setError] = useState(null)

  const postRef = useMemo(() => {
    return doc(firestore, room, postId)
  }, [room, postId])

  const commentsRef = useMemo(() => {
    return collection(firestore, room, postId, 'comments')
  }, [room, postId])

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
      <FirestoreItemHeader {...{creatorUid, timestamp, profile}} />
      <FirestoreItemContent {...{content}} />
      <FirestoreItemActions 
        firestoreDoc={postRef} 
        firestoreCollection={commentsRef} 
        {...{postId, room, showComments, setShowComments}}
      />

      { 
        showComments && (
          <PopUp setIsPopUpShown={setShowComments} style={{paddingTop: '2em'}}> 
            <Comments {...{room, postId}} firestoreRef={commentsRef} />
          </PopUp>
        ) 
      }
    </div>
  )
}

export default memo(Post)