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
                <img src={profile.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} alt="profile" className="post-header-profile-image" />
              ) : null
            }
            <div>
              <p>{profile?.displayName}</p>
              {timestamp && <p style={{fontSize: '.65rem', color: '#8a7263'}}>{formattedTime}</p>}
            </div>
          </div>
        </Link>
    )
}

export default FirestoreItemHeader