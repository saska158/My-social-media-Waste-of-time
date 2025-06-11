import { useState } from "react"

const LinkPreview = ({linkData, children, style, imgStyle=null}) => {
  const [expanded, setExpanded] = useState(false)
  const limit = 100

  const isLong = linkData.description.length > limit
  const visibleText = expanded ? linkData.description : linkData.description.slice(0, limit)

    return (
        <div /*className="link-preview-container"*/>
          {
            linkData.description !== 'Too many requests / rate limit exceeded' ? (
              <div 
                className="link-preview-container"
                //style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative'}}
              >
                <a 
                  href={linkData.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={style}
                >
                  <img
                    src={linkData.image}
                    alt={linkData.title}
                    style={{...imgStyle, borderTopLeftRadius: '15px', borderTopRightRadius: '15px'}}
                  />
                </a>
                <p style={{fontSize: '.6rem', padding: '0 1em'}}>
                  <p style={{textTransform: 'initial', fontSize: '.85rem', margin: '.5em 0', fontWeight: '700'}}>{linkData.title}</p>
                  <p style={{color: 'grey'}}>{visibleText}</p>
                  {isLong && !expanded && '... '}
                  {isLong && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpanded(!expanded)
                      }}
                      style={{ color: '#f05593', cursor: 'pointer' }}
                    >
                      {expanded ? ' See less' : ' See more'}
                    </span>
                  )}
                </p>
                {children}
              </div>
            ) : null
          }
        </div>
    )
}

export default LinkPreview

/*
<p style={{fontSize: '.7rem', color: '#f05593', padding: '.5em', borderRadius: '20px'}}>
                Link preview currently unavailable.
              </p>
*/