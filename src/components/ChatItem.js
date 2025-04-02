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
          className="chat-item-container"
          onClick={() => pickChat(chatPartnerUid, chatPartner, setIsChatBoxVisible)}
        >
          <div className="chat-item-infos">
            <img 
              src={chatPartner.photoURL} 
              alt="sender" 
              className="chat-item-profile-image"
            />
            <span>{chatPartner.displayName}</span>
          </div>
          <p>{lastMessage.content}</p>
        </div>
    )
}

export default ChatItem