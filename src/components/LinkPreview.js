const LinkPreview = ({linkData, linkPreviewRef=null, children, style=null, imgStyle=null}) => {

    return (
        <div ref={linkPreviewRef}>
          {
            linkData.description === 'Too many requests / rate limit exceeded' ? (
              <p style={{fontSize: '.8rem'}}>
                Too many requests / rate limit exceeded.
                Link can't be shown.
              </p>
            ) : (
              <div style={{display: 'flex', alignItems: 'flex-start'}}>
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
                  <div>
                    <p style={{textTransform: 'initial', fontSize: '.75rem'}}>{linkData.title}</p>
                    <p style={{fontSize: '.6rem', color: 'grey'}}>{linkData.description}</p>
                  </div>
                </a>
                {children}
              </div>
            )
          }
        </div>
    )
}

export default LinkPreview