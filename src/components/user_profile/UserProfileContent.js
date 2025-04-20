import UserPosts from "./UserPosts"

const UserProfileContent = ({activeSection, profile, profileUid}) => {
    return (
        <div className="user-profile-description">
            {
                activeSection === "bio" ? <p>{profile[activeSection]}</p> :
                activeSection === 'posts' ? (
                    <UserPosts {...{profileUid}} />
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
                        {Object.entries(profile[activeSection]).map(([key, value]) => (
                            <div key={key}>
                                <span style={{textTransform: 'uppercase', fontSize: '.8rem', color: 'white'}}>
                                    {key}: 
                                </span>
                                <p>{value}</p>
                            </div>
                        ))}
                    </div>
                )
            }

        </div>
    )
}

export default UserProfileContent