const ChatBoxHeader = ({chatPartnerProfile, setIsChatBoxVisible}) => {
    return (
        <div 
          style={{
            position: 'sticky', 
            top: '0', 
            left: '0', 
            right: '0', 
            background: 'rgb(238, 171, 163)', 
            display: 'flex',
            padding: '.5em'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.5em'
            }}
          >
            <img
              src={chatPartnerProfile.photoURL}
              alt="profile-photo"
              style={{
                width: '40px', 
                height: '40px',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'inline',
                borderRadius: '50%',
              }}
            />
            <p>{ chatPartnerProfile.displayName }</p>
          </div>
          <button 
            onClick={() => setIsChatBoxVisible(false)}
            style={{
              marginLeft: 'auto',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} /*className="size-6"*/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
    )
}

export default ChatBoxHeader