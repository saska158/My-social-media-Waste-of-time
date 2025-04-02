const UserProfileNavigation = ({activeSection, setActiveSection}) => {
    const sections = ['description', 'musicTaste', 'politicalViews', 'posts']
    return (
        <div className="user-profile-container-nav">
            {
                sections.map(section => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    style={{color: activeSection === section ? "white" : ''}}
                  >
                    {section}
                  </button>
                ))
            }
        </div>
    )
}

export default UserProfileNavigation