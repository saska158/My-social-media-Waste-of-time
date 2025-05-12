import { useState } from "react"
import PopUp from "../PopUp"
import FirestoreItemHeader from "./FirestoreItemHeader"
import FirestoreItemContent from "./FirestoreItemContent"

const Reply = ({reply}) => {
  const { creatorUid, content, timestamp } = reply

  // State
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }

  return (
    <div className="comment-container">
      <div className="comment-content" style={{background: 'white', width: '80%', marginLeft: '2em'}}>
        <FirestoreItemHeader {...{creatorUid, timestamp}} />
        <FirestoreItemContent {...{content}} />
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

export default Reply