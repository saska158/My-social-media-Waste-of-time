const UserSkeleton = () => {
    return (
        <div className="user-item skeleton" style={{marginTop: '1em'}}>
          <div className="user-img user-img-medium" style={{background: '#5c3d2a'}}></div>
          <span style={{background: '#5c3d2a', width: '100px', height: '20px', marginLeft: '.5em', borderRadius: '15px'}}></span>
        </div>
    )
}

export default UserSkeleton