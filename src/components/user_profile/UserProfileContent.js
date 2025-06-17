import UserPosts from "./UserPosts"

const UserProfileContent = ({activeSection, profile, profileUid}) => {
    return (
        <div style={{padding: '.5em'}}>
            {
              activeSection === "bio" ? (
                <p style={{wordBreak: 'break-word'}}>{profile[activeSection]}</p>
              ) :
              activeSection === 'posts' && profileUid ? (
                <UserPosts {...{profileUid}} />
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5em'}}>
                  {Object.entries(profile[activeSection]).map(([key, value]) => (
                    <div key={key} style={{wordBreak: 'break-word'}}>
                      <span 
                        style={{
                          display: 'block', 
                          marginBottom: '.5em',
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