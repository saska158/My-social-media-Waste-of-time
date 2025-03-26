const ChatItem = ({chat, setIsChatBoxVisible, setChatPartner}) => {
    const { chatPartnerUid, chatPartner, id, lastMessage } = chat

    // Functions
    const pickChat = (chatPartnerUid, chatPartner, setIsChatBoxVisible) => {
        setIsChatBoxVisible(true)
        setChatPartner({uid: chatPartnerUid, profile: chatPartner})
    }

    return (
        <div 
          key={id} 
          style={{ 
            background: 'white',
            borderRadius: '20px',
            margin: '0 1em 1em',
            padding: '.5em', 
            cursor: 'pointer'
          }}
          onClick={() => pickChat(chatPartnerUid, chatPartner, setIsChatBoxVisible)}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src={chatPartner.photoURL} 
              alt="sender" 
              style={{
                width: '30px', 
                height: '30px', 
                display: 'inline',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'top'
              }}
            />
            <span>{chatPartner.displayName}</span>
          </div>
          <p>{lastMessage.content}</p>
        </div>
    )
}

export default ChatItem