import { useState, useEffect } from "react"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"

const Comment = ({comment, index}) => {
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)

  useEffect(() => {
    if(comment.content.text) {
      const urls = extractUrls(comment.content.text)
      if (urls && urls.length > 0) {
        fetchLinkPreview(urls[0]).then(setLinkData) 
      } else {
        setLinkData(null) 
      }
    }
  }, [comment.content.text])

  return (
    <div key={index} className="comment-container">
      <img
        src={comment.photoURL}
        alt="profile"
        className="comment-profile-image"
      />
      <div className="comment-content">
        <p>{comment.name}</p>
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
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsImageViewerShown(true)
                    }}
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