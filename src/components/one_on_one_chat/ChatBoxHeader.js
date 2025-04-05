const ChatBoxHeader = ({chatPartnerProfile, setIsChatBoxVisible}) => {
    return (
        <div className="chat-box-header-container">
          <div className="chat-box-header-infos">
            <img src={chatPartnerProfile?.photoURL} alt="profile-photo" className="chat-box-header-image" />
            <p>{ chatPartnerProfile?.displayName }</p>
          </div>
          <button onClick={() => setIsChatBoxVisible(false)} style={{marginLeft: 'auto'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}} /*className="size-6"*/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
    )
}

export default ChatBoxHeader