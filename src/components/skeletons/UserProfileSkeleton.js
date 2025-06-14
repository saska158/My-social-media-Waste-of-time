const UserPofileSkeleton = () => {
    return (
        <div className="user-profile-container skeleton" style={{padding: '.5em 1em'}}>
            <div className="user-img user-img-big" style={{background: "#eaf4f0", marginBottom: '.5em'}}></div>
            <div style={{background: '#eaf4f0', width: '100px', height: '20px', borderRadius: '15px'}}></div>
        </div>
    )
}

export default UserPofileSkeleton