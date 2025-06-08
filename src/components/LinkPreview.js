import { useState } from "react"

const LinkPreview = ({linkData, children, style, imgStyle=null}) => {
  const [expanded, setExpanded] = useState(false)
  const limit = 100

  const isLong = linkData.description.length > limit
  const visibleText = expanded ? linkData.description : linkData.description.slice(0, limit)

    return (
        <div>
          {
            linkData.description === 'Too many requests / rate limit exceeded' ? (
              <p style={{fontSize: '.7rem', color: '#f05593', padding: '.5em', borderRadius: '20px'}}>
                Link can't be shown.
              </p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <a 
                  href={linkData.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={style}
                >
                  <img
                    src={linkData.image}
                    alt={linkData.title}
                    style={imgStyle}
                  />
                  <p style={{textTransform: 'initial', fontSize: '.85rem', margin: '.5em 0', fontWeight: '700'}}>{linkData.title}</p>
                </a>
                <p style={{fontSize: '.6rem', color: 'grey'}}>
                  {visibleText}
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
                {/*{children}*/}
              </div>
            )
          }
        </div>
    )
}

export default LinkPreview