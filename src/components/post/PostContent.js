import { useState, useEffect, useRef } from "react"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import { useLoading } from "../../contexts/loadingContext"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"

const PostContent = ({post}) => {
  // Context
  const { loadingState, setLoadingState } = useLoading() 

  // State  
  const [linkData, setLinkData] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)
  const [error, setError] = useState(null)

  // Hooks that don't trigger re-renders
  const linkPreviewRef = useRef(null)  

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }

  // Effects
  /* effect to detect and fetch preview when user types a URL */
  useEffect(() => {
    const fetchData = async () => {
      setLoadingState(prev => ({...prev, upload: true}))
      try {
        const urls = extractUrls(post.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0]) //mislim da je ovo primer kako sam resila
          setLinkData(linkDetails)                            // pomocu async/await tamo gde imam .then() 
        }
      } catch(error) {
        setError(error)
      } finally {
        setLoadingState(prev => ({...prev, upload: false}))
      }
    }
    fetchData()
  }, [post.text]) 

  return (
    <div>
      {
        linkData ? <LinkPreview {...{linkData, linkPreviewRef}}/> : (
          <div>
            <p style={{fontSize: '.8rem', padding: '0 .5em'}}>{post?.text}</p>
            {
              post.image && (
                <img
                  src={post.image}
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
            <img src={post.image} alt="image viewer" />
          </PopUp>
        )
      }
    </div>
  )
}

export default PostContent