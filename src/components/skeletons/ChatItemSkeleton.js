const ChatItemSkeleton = () => {
    return (
        <div className="chat-item-container skeleton" style={{width: '60%'}}>
          <div className="chat-item-infos">
            <div className="chat-item-profile-image" style={{background: '#eaf4f0'}}></div>
            <span style={{background: '#eaf4f0', width: '30px', height: '20px', marginLeft: '.5em', borderRadius: '15px'}}></span>
          </div>
          <p style={{background: '#eaf4f0', width: '70%', height: '30px', marginTop: '.5em', borderRadius: '15px'}}></p>
        </div>
    )
}

export default ChatItemSkeleton