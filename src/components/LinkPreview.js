//import { useState } from "react"

const LinkPreview = ({linkData, children, style, imgStyle=null}) => {
  //const [expanded, setExpanded] = useState(false)
  const limit = 200

  //const isLong = linkData.description.length > limit
  const visibleText =/* expanded ? linkData.description :*/ linkData.description.slice(0, limit)

    return (
        <div>
          {
            linkData.description !== 'Too many requests / rate limit exceeded' ? (
              <div className="link-preview-container">
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
                <div style={{padding: '0 1em'}}>
                  <p 
                    style={{
                      textTransform: 'uppercase', 
                      color: '#000',
                      margin: '.5em 0', 
                      fontWeight: '700'
                    }}>
                      {linkData.title}
                    </p>
                  <p style={{fontSize: '.9rem'}}>{visibleText}...</p>
                 {/* {isLong && !expanded && '... '}
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
                  )}*/}
                </div>
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