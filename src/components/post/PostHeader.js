import { Link } from "react-router-dom"
import { formatPostTimestamp } from "../../utils/formatTimestamps"

const PostHeader = ({creatorUid, timestamp, profile}) => {
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
              <p style={{fontSize: '.65rem'}}>{formatPostTimestamp(timestamp)}</p>
            </div>
          </div>
        </Link>
    )
}

export default PostHeader