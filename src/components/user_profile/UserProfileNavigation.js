const UserProfileNavigation = ({activeSection, setActiveSection}) => {
    const sections = ['bio', 'currently', 'favorites', 'posts']
    return (
        <div className="user-profile-container-nav">
            {
                sections.map(section => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    style={{
                      border: activeSection === section ? ".5px solid #000" : "none",
                      borderRadius: '30px',
                      padding: '.5em 1em'
                    }}
                  >
                    {section}
                  </button>
                ))
            }
        </div>
    )
}

export default UserProfileNavigation