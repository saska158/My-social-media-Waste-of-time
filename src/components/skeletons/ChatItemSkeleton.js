const ChatItemSkeleton = () => {
    return (
        <div className="chat-item-container skeleton">
          <div className="chat-item-infos">
            <div className="chat-item-profile-image" style={{background: '#facdd4'}}></div>
            <span style={{background: '#facdd4', width: '30px', height: '20px', marginLeft: '.5em', borderRadius: '15px'}}></span>
          </div>
          <p style={{background: '#facdd4', width: '70%', height: '30px', marginTop: '.5em', borderRadius: '15px'}}></p>
        </div>
    )
}

export default ChatItemSkeleton