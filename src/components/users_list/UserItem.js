import { Link } from "react-router-dom"

const UserItem = ({user}) => {
    return (
      <Link to={`/user/${user?.uid}`}>
        <div className="user-item">
          <div style={{position: 'relative', width: '45px', height: '45px'}}>
            <img 
              src={user?.photoURL || process.env.PUBLIC_URL + "/images/no-profile-picture.png"} 
              alt="profile"
              style={{
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                objectPosition: 'center',
                borderRadius: '50%'
              }}
            />
            {
              user?.isActive && <span className="online-indicator"></span>
            }
          </div>
          <span style={{fontWeight: '700', color: '#000'}}>{user?.displayName}</span>
        </div>
      </Link>
    )
}

export default UserItem