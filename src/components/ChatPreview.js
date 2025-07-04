import useFormattedTime from "../hooks/useFormattedTime"

const ChatPreview = ({
    chatPartnerUid, 
    setIsChatBoxVisible, 
    receiverUid, 
    receiverPhoto, 
    receiverName, senderPhoto, 
    senderName, 
    contentText, 
    contentImage,
    pickChat,
    timestamp
}) => {

  const formattedTime = useFormattedTime(timestamp)
    return (
      <div 
        className="chat-item-container"
        onClick={() => pickChat(chatPartnerUid, setIsChatBoxVisible)}
      >
        <img 
          src={receiverUid === chatPartnerUid ? receiverPhoto : senderPhoto} 
          alt="sender" 
          className="user-img user-img-medium"
        />
        <div>
          <span style={{fontWeight: '700'}}>{receiverUid === chatPartnerUid ? receiverName : senderName}</span>
          <div className="chat-item-content">
            {
              contentImage ? (
                <p style={{display: 'flex', alignItems: 'center', gap: '.3em'}}> 
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '20px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg> Photo image
                </p>
              ) : (
                <p>{`${contentText.slice(0, 18)}...`}</p>
              )
            }
          </div>
        </div>
        <p className="chat-item-time">{formattedTime}</p>
      </div>
    )
}

export default ChatPreview