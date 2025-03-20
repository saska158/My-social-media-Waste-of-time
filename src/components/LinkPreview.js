const LinkPreview = ({linkData, linkPreviewRef=null, children}) => {
    return (
        <div 
          style={{ 
            marginTop: "10px", 
          }}
          ref={linkPreviewRef}
        >
          {
            linkData.description === 'Too many requests / rate limit exceeded' ? (
                <p style={{fontSize: '.8rem'}}>
                    Too many requests / rate limit exceeded.
                    Link can't be shown.
                </p>
            ) : (
                <div>
                  {children}
                  <a href={linkData.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={linkData.image}
                      alt={linkData.title}
                      style={{ width: "100%", /*marginRight: "10px" */}}
                    />
                    <div>
                      <p style={{textTransform: 'initial'}}>{linkData.title}</p>
                      {/*<p>{videoData.description}</p>*/}
                    </div>
                  </a>
                </div>
            )
          }
        </div>
    )
}

export default LinkPreview