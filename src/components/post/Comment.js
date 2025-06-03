import { useState, useMemo } from "react"
import { firestore, collection, doc } from "../../api/firebase"
import PopUp from "../PopUp"
import FirestoreItemHeader from "./FirestoreItemHeader"
import FirestoreItemContent from "./FirestoreItemContent"
import FirestoreItemActions from "./FirestoreItemActions"
import Replies from "./Replies"

const Comment = ({comment, room, postId}) => {
  const { id: commentId, creatorUid, creatorName, content, timestamp } = comment
  // State
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [showComments, setShowComments] = useState(false)

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

  return (
    <div className="comment-container">
      <div className="comment-content"> 
        <FirestoreItemHeader {...{creatorUid, timestamp}} />
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