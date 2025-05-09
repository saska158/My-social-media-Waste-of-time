import { useState, useEffect } from "react"
import fetchProfile from "../../api/fetchProfile"
import PopUp from "../PopUp"
import FirestoreItemHeader from "./FirestoreItemHeader"
import FirestoreItemContent from "./FirestoreItemContent"

const Reply = ({reply}) => {
  const { creatorUid, content, timestamp } = reply
  // State
  const [profile, setProfile] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      <div className="comment-content" style={{background: 'white', width: '80%', marginLeft: '2em'}}>
        <FirestoreItemHeader {...{creatorUid, timestamp, profile}} />
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