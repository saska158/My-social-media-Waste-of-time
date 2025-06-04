const UserSkeleton = () => {
    return (
        <div className="chat-item-container skeleton">
          <div className="chat-item-infos">
            <div className="chat-item-profile-image" style={{background: 'rgb(126, 84, 58)'}}></div>
            <span style={{background: 'rgb(126, 84, 58)', width: '100px', height: '20px', marginLeft: '.5em', borderRadius: '15px'}}></span>
          </div>
        </div>
    )
}

export default UserSkeleton