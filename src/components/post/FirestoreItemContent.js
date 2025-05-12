import { useState, useEffect, useRef } from "react"
import fetchLinkPreview from "../../api/fetchLinkPreview"
import extractUrls from "../../utils/extractUrls"
import linkify from "../../utils/linkify"
import LinkPreview from "../LinkPreview"
import PopUp from "../PopUp"

const FirestoreItemContent = ({content}) => {
  // State  
  const [linkData, setLinkData] = useState(null)
  const [linkFromText, setLinkFromText] = useState(null)
  const [isImageViewerShown, setIsImageViewerShown] = useState(false)

  // Functions
  const handleImageViewer = (e) => {
    e.stopPropagation()
    setIsImageViewerShown(true)
  }

  // Effects
  useEffect(() => {    
    const fetchData = async () => {
      try {
        const urls = extractUrls(content.text)
        if(urls && urls.length > 0) {
          const linkDetails = await fetchLinkPreview(urls[0]) 
          setLinkData(linkDetails)  
          setLinkFromText(urls[0])                          
        }
      } catch(error) {
        console.error("Error fetching link preview:", error)
      } 
    }
    fetchData()
  }, [content.text]) 

  return (
    <div className="post-content">
      <div style={{paddingBottom: '1em'}}>
        <p style={{fontSize: '.8rem', padding: '0 .5em'}}>
          {/*content?.text*/}
          {linkify(content.text)}
        </p>
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
      {
        linkData && (
          <LinkPreview {...{linkData, content}} style={{display: 'flex', flexDirection: 'column'}} imgStyle={{width: '100%'}}/>
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

export default FirestoreItemContent