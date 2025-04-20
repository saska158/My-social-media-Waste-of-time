const UserProfileNavigation = ({activeSection, setActiveSection}) => {
    const sections = ['bio', 'currently', 'favorites', 'posts']
    return (
        <div className="user-profile-container-nav">
            {
                sections.map(section => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    style={{color: activeSection === section ? "white" : '', textTransform: 'uppercase'}}
                  >
                    {section}
                  </button>
                ))
            }
        </div>
    )
}

export default UserProfileNavigation