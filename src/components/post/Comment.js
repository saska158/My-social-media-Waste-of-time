import { useState, useEffect, useMemo } from "react"
import { firestore, collection, doc } from "../../api/firebase"
import fetchProfile from "../../api/fetchProfile"
import PopUp from "../PopUp"
import FirestoreItemHeader from "./FirestoreItemHeader"
import FirestoreItemContent from "./FirestoreItemContent"
import FirestoreItemActions from "./FirestoreItemActions"
import Replies from "./Replies"

const Comment = ({comment, room, postId}) => {
  const { id: commentId, creatorUid, creatorName, content, timestamp } = comment
  // State
  const [profile, setProfile] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const commentRef = useMemo(() => {
    return doc(firestore, room, postId, 'comments', commentId)
  }, [room, postId, commentId])

  const repliesRef = useMemo(() => {
    return collection(firestore, room, postId, 'comments', commentId, 'replies')
  }, [room, postId, commentId])

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }
 
  // Effects
  useEffect(() => {
    const getProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        await fetchProfile(creatorUid, setProfile)
      } catch(error) {
        console.error("Error fetching profile:", error)
        setError(error.message || "Failed to fetch profile")
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [creatorUid])

  return (
    <div className="comment-container">
      <div className="comment-content" style={{background: showComments ? '#f8a9a2' : '#f7d4d1'}}>
        <FirestoreItemHeader {...{creatorUid, timestamp, profile}} />
        <FirestoreItemContent {...{content}} />
        <FirestoreItemActions
          firestoreDoc={commentRef} 
          firestoreCollection={repliesRef} 
          {...{postId, commentId, room, showComments, setShowComments}}
        />
        {
          showComments && (
           <Replies firestoreRef={repliesRef} creatorName={creatorName} />
          )
        }
      </div>
      {
        isImageViewerShown && (
          <PopUp setIsPopUpShown={setIsImageViewerShown}>
            <img src={content.image} alt="image viewer" />
          </PopUp>
        )
      }
    </div>
  )
}

export default Comment