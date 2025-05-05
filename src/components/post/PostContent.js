import { useState, useEffect, useRef } from "react"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"

const PostContent = ({content}) => {
  // State  
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Hooks that don't trigger re-renders
  const linkPreviewRef = useRef(null)  

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }

  // Effects
  useEffect(() => {
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

  return (
    <div className="post-content">
      {
        linkData ? (
          <LinkPreview {...{linkData, linkPreviewRef, content}} style={{display: 'flex', flexDirection: 'column'}} imgStyle={{width: '100%'}}/>
        ) : (
          <div>
            <p style={{fontSize: '.8rem', padding: '0 .5em'}}>{content?.text}</p>
            {
              content.image && (
                <img
                  src={content.image}
                  alt="post-image"
                  style={{cursor: 'pointer'}}
                  onClick={handleImageViewer}
                />
              )
            }
          </div>
        )
      }
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

export default PostContent