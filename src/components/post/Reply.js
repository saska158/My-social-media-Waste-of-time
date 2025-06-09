import FirestoreItemHeader from "./FirestoreItemHeader"
import FirestoreItemContent from "./FirestoreItemContent"

const Reply = ({reply}) => {
  const { creatorUid, content, timestamp } = reply

  return (
    <div className="comment-container">
      <div className="comment-content reply-content">
        <FirestoreItemHeader {...{creatorUid, timestamp}} />
        <FirestoreItemContent {...{content}} />
      </div>
    </div>
  )
}

export default Reply