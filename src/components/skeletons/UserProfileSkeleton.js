const UserPofileSkeleton = () => {
    return (
        <div className="user-profile-container skeleton" style={{padding: '.5em 1em'}}>
            <div className="user-img user-img-big" style={{background: "#5c3d2a", marginBottom: '.5em'}}></div>
            <div style={{background: '#5c3d2a', width: '100px', height: '20px', borderRadius: '15px'}}></div>
        </div>
    )
}

export default UserPofileSkeleton