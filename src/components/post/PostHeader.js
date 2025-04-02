import { Link } from "react-router-dom"

const PostHeader = ({creatorUid, profile}) => {
    return (
        <Link to={creatorUid ? `/user/${creatorUid}` : '/my-profile'}>
          <div className="post-header-container">
            {
              profile?.photoURL ? (
                <img src={profile.photoURL} alt="profile" className="post-header-profile-image" />
              ) : null
            }
            <div>
              <p><strong>{profile?.displayName}</strong></p>
            </div>
          </div>
        </Link>
    )
}

export default PostHeader