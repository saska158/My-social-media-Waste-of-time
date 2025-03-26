import { Link } from "react-router-dom"

const PostHeader = ({creatorUid, profile}) => {
    return (
        <Link to={creatorUid ? `/user/${creatorUid}` : '/my-profile'}>
          <div style={{display: 'flex', padding: '.5em', cursor: 'pointer'}}>
            {
              profile?.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt="profile" 
                  style={{
                    width: '30px', 
                    height: '30px',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    display: 'inline',
                    borderRadius: '50%'
                  }}
                />
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