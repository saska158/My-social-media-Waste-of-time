import UserPosts from "./UserPosts"

const UserProfileContent = ({activeSection, profile, profileUid}) => {
    return (
        <div>
            {
                activeSection === "bio" ? <p>{profile[activeSection]}</p> :
                activeSection === 'posts' && profileUid ? (
                    <UserPosts {...{profileUid}} />
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5em'}}>
                        {Object.entries(profile[activeSection]).map(([key, value]) => (
                            <div key={key}>
                                <span 
                                  style={{
                                    display: 'block', 
                                    marginBottom: '.5em',
                                    fontFamily: "'Anton', sans-serif"
                                  }}
                                >
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