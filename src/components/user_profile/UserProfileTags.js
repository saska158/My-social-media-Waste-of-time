const UserProfileTags = ({activeSection, profile}) => {
    const tags = ['description', 'musicTaste', 'politicalViews']
    const activeTag = tags.filter(tag => tag === activeSection )
    return (
        <>
          {profile[activeTag]}
        </>
    )
}

export default UserProfileTags