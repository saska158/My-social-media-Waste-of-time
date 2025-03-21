import { useState, useEffect } from "react"
import fetchLinkPreview from "../api/fetchLinkPreview"
import extractUrls from "../utils/extractUrls"
import LinkPreview from "./LinkPreview"
import PopUp from "./PopUp"

const Comment = ({comment, index}) => {
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)

  useEffect(() => {
    if(comment.content.text) {
      const urls = extractUrls(comment.content.text)
      if (urls && urls.length > 0) {
        fetchLinkPreview(urls[0]).then(setLinkData) // We take the first URL from the input
      } else {
        setLinkData(null) // Clear preview if no URL is detected
      }
    }
  }, [comment.content.text])

  return (
    <div 
      key={index} 
      style={{
        display: 'flex', 
        alignItems: 'flex-start',
        gap: '.3em',
        marginBottom: '1em'
      }}
    >
      <img
        src={comment.photoURL}
        alt="profile"
        style={{
          width: '30px', 
          height: '30px',
          objectFit: 'cover',
          objectPosition: 'top',
          display: 'inline',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          background: '#f7d4d1',
          borderRadius: '10px',
          padding: '1em'
        }}
      >
        <p>{comment.name}</p>
        {
          linkData ? (
            <LinkPreview 
              linkData={linkData}
            />
          ) : (
            <div>
              {
                comment.content.text && <p>{comment.content.text}</p>
              }
              {
                comment.content.image && (
                  <img
                    src={comment.content.image}
                    alt="comment-image"
                    style={{
                      width: '100px',
                      cursor: 'pointer'
                    }}
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
          <PopUp
            setIsPopUpShown={setIsImageViewerShown}
          >
            <img
              src={comment.content.image}
              alt="image viewer"
            />
          </PopUp>
        )
      }
    </div>
  )
}

export default Comment