import { useState, memo, useMemo } from "react"
import { firestore, collection, doc } from "../../api/firebase"
import FirestoreItemHeader from "./FirestoreItemHeader"
import FirestoreItemContent from "./FirestoreItemContent"
import FirestoreItemActions from "./FirestoreItemActions"
import PopUp from "../PopUp"
import Comments from "./Comments"

const Post = ({post, room,  style = {}}) => {
  const { id: postId, creatorUid, content, timestamp } = post

  // State
  const [showComments, setShowComments] = useState(false)

  const postRef = useMemo(() => {
    return doc(firestore, room, postId)
  }, [room, postId])

  const commentsRef = useMemo(() => {
    return collection(firestore, room, postId, 'comments')
  }, [room, postId])

  return (
    <div key={postId} className="post-container" style={style}>
      <FirestoreItemHeader {...{creatorUid, timestamp}} />
      <FirestoreItemContent {...{content}} />
      <FirestoreItemActions 
        firestoreDoc={postRef} 
        firestoreCollection={commentsRef} 
        {...{postId, room, showComments, setShowComments}}
      />

      { 
        showComments && (
          <PopUp setIsPopUpShown={setShowComments}> 
            <Comments {...{room, postId}} firestoreRef={commentsRef} />
          </PopUp>
        ) 
      }
    </div>
  )
}

export default memo(Post)