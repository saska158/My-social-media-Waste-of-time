import { useState, useEffect } from "react"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import useFormattedTime from "../../hooks/useFormattedTime"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"

const Comment = ({comment, index}) => {
  // State
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Custom hooks
  const formattedTime = useFormattedTime(comment.timestamp)

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }
 
  // Effects
  useEffect(() => {
    if(!comment.content.text) return
    setLoading(true)
    const fetchData = async () => {
      try {
        const urls = extractUrls(comment.content.text)
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
  }, [comment.content.text])

  return (
    <div key={index} className="comment-container">
      <img src={comment.photoURL} alt="profile" className="comment-profile-image" />
      <div className="comment-content">
        <div 
          style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '2em',
          }}
        >
          <p>{comment.name}</p>
          <p style={{fontSize: '.55rem'}}>{formattedTime}</p>
        </div>
        {
          linkData ? <LinkPreview {...{linkData}} /> : (
            <div>
              { comment.content.text && <p>{comment.content.text}</p> }
              {
                comment.content.image && (
                  <img
                    src={comment.content.image}
                    alt="comment-image"
                    className="comment-content-image"
                    onClick={handleImageViewer}
                  />
                )
              }
            </div>
          )
        }
      </div>
      {
        isImageViewerShown && (
          <PopUp setIsPopUpShown={setIsImageViewerShown}>
            <img src={comment.content.image} alt="image viewer" />
          </PopUp>
        )
      }
    </div>
  )
}

export default Comment