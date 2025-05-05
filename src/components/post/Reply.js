import { useState, useEffect, useMemo } from "react"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import useFormattedTime from "../../hooks/useFormattedTime"
import fetchProfile from "../../api/fetchProfile"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"
import CommentActions from "./CommentActions"
import PostHeader from "./PostHeader"
import PostContent from "./PostContent"
import PostActions from "./PostActions"
import Comments from "./Comments"
import Replies from "./Replies"
import { collection } from "firebase/firestore"
import { firestore } from "../../api/firebase"

const Reply = ({reply}) => {
  const { creatorUid, content, timestamp } = reply
  // State
  const [profile, setProfile] = useState(null)
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


  // Custom hooks
  const formattedTime = useFormattedTime(timestamp)

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }
 
  // Effects
  useEffect(() => {
    if(!content.text) return
    setLoading(true)
    const fetchData = async () => {
      try {
        const urls = extractUrls(content.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0]) //mislim da je ovo primer kako sam resila
          setLinkData(linkDetails)                            // pomocu async/await tamo gde imam .then() 
        }
      } catch(error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [content.text])

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
    <div className="comment-container">
      <div className="comment-content" style={{background: 'white', width: '80%', marginLeft: '2em'}}>
        <PostHeader {...{creatorUid, timestamp, profile}} />
        <PostContent {...{content}} />
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