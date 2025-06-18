const UserProfileNavigation = ({activeSection, setActiveSection}) => {
    const sections = ['currently', 'favorites', 'posts']
    return (
      <div className="user-profile-container-nav">
        {
          sections.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                border: activeSection === section ? 'none' : "2px solid #eaf4f0",
                background: activeSection === section ? "#eaf4f0" : "none",
                fontSize: '.9rem'
              }}
              className="post-category-navlink"
            >
              {section.charAt(0).toUpperCase()+section.slice(1)}
            </button>
          ))
        }
      </div>
    )
}

export default UserProfileNavigation