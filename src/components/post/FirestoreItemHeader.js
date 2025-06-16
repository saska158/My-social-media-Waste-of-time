import { useState, useEffect } from "react"
import fetchProfile from "../../api/fetchProfile"
import { Link } from "react-router-dom"
import useFormattedTime from "../../hooks/useFormattedTime"

const FirestoreItemHeader = ({creatorUid, timestamp}) => {
  const formattedTime = useFormattedTime(timestamp)

  // State
  const [profile, setProfile] = useState(null)

  // Effects
  useEffect(() => {
    const getProfile = async () => {
      try {
        await fetchProfile(creatorUid, setProfile)
      } catch(error) {
        console.error("Error fetching profile:", error)
      } 
    }

    getProfile()
  }, [creatorUid])

    return (
        <Link to={creatorUid ? `/user/${creatorUid}` : '/my-profile'}>
          <div className="post-header-container">
            {
              profile?.photoURL ? (
                <img 
                  src={profile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
                  alt="profile" 
                  className="user-img user-img-medium" 
                />
              ) : null
            }
            <div 
              style={{
                display: 'flex', 
                flexDirection: 'column',
                gap: '.3em'
                }}
              >
              <span 
                style={{
                  fontWeight: '800', 
                  color: '#000',
                }}>
                  {profile?.displayName}
                </span>
              {timestamp && (
                <span>{formattedTime}</span>
              )}
            </div>
          </div>
        </Link>
    )
}

export default FirestoreItemHeader