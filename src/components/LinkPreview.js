
const LinkPreview = ({linkData, children, style, imgStyle=null}) => {

  const limit = 200

  const visibleText = linkData.description.slice(0, limit)

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
                  <p style={{fontSize: '.9rem', wordBreak: 'break-all'}}>{visibleText}...</p>
                </div>
                {children}
              </div>
            ) : null
          }
        </div>
    )
}

export default LinkPreview

