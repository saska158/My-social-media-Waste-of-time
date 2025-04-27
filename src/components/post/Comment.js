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

  // Custom hooks
  const formattedTime = useFormattedTime(comment.timestamp)

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }
 
  // Effects
  useEffect(() => {
    if(comment.content.text) {
      const urls = extractUrls(comment.content.text) // treba li greska? ili je u okviru extractUrls
      if (urls && urls.length > 0) {
        fetchLinkPreview(urls[0]).then(setLinkData) // ovde sigurno treba, nema catch. mislim da sam negde
      } else {                                      // vec napravila sa async/await
        setLinkData(null) 
      }
    }
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