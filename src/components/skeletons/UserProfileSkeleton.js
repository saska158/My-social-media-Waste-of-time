const UserPofileSkeleton = () => {
    return (
        <div className="user-profile-container skeleton">
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div className="user-profile-content" style={{padding: '1em'}}>
                    <div className="user-profile-profile-picture" style={{background: 'salmon'}}></div>
                </div>
              <div className="user-profile-description skeleton"></div>   
            </div>
        </div>
    )
}

export default UserPofileSkeleton