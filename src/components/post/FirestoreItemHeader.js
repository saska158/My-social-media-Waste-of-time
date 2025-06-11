import { useState, useEffect } from "react"
import fetchProfile from "../../api/fetchProfile"
import { Link } from "react-router-dom"
import useFormattedTime from "../../hooks/useFormattedTime"

const FirestoreItemHeader = ({creatorUid, timestamp}) => {
  const formattedTime = useFormattedTime(timestamp)

  console.log('time', formattedTime)

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
                <img src={profile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} alt="profile" className="user-img user-img-medium" />
              ) : null
            }
            <div>
              <span style={{fontWeight: '700', display: 'inline-block', marginBottom: '8px'}}>{profile?.displayName}</span>
              {timestamp && (
                <p style={{color: "rgb(107, 109, 136)"}}>{formattedTime}</p>
              )}
            </div>
          </div>
        </Link>
    )
}

export default FirestoreItemHeader