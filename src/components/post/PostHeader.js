import { Link } from "react-router-dom"
import useFormattedTime from "../../hooks/useFormattedTime"

const PostHeader = ({creatorUid, timestamp, profile}) => {
  const formattedTime = useFormattedTime(timestamp)
    return (
        <Link to={creatorUid ? `/user/${creatorUid}` : '/my-profile'}>
          <div className="post-header-container">
            {
              profile?.photoURL ? (
                <img src={profile.photoURL} alt="profile" className="post-header-profile-image" />
              ) : null
            }
            <div>
              <p>{profile?.displayName}</p>
              {timestamp && <p style={{fontSize: '.65rem'}}>{formattedTime}</p>}
            </div>
          </div>
        </Link>
    )
}

export default PostHeader