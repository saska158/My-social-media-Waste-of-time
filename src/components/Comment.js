import { useState, useEffect } from "react"
import fetchLinkPreview from "../api/fetchLinkPreview"
import extractUrls from "../utils/extractUrls"
import LinkPreview from "./LinkPreview"

const Comment = ({comment, index}) => {
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dsjpoak0f/upload"  
    const UPLOAD_PRESET = "profile_pictures"

    const [linkData, setLinkData] = useState(null)

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
                borderRadius: '50%'
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
                    <p>{comment.content.text}</p>
                )
              }
            </div>
        </div>
    )
}

export default Comment