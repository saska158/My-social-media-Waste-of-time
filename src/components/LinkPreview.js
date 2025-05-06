const LinkPreview = ({linkData, /*linkFromText,*/ children, style=null, imgStyle=null, content}) => {

    return (
        <div>
          {
            linkData.description === 'Too many requests / rate limit exceeded' ? (
              <p style={{fontSize: '.8rem', background: 'rgb(247, 198, 193)', color: 'white', textAlign: 'center', padding: '.5em', borderRadius: '20px'}}>
                Too many requests / rate limit exceeded.
                Link can't be shown.
                {/* content.text */}
                {/* linkFromText */}
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